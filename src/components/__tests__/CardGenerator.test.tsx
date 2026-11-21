import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CardGenerator from '@/components/CardGenerator'
import * as generateCardModule from '@/lib/generateCard'

jest.mock('@/lib/generateCard', () => ({
  ...jest.requireActual('@/lib/generateCard'),
  preloadTemplate: jest.fn().mockResolvedValue({}),
  renderCard: jest.fn().mockResolvedValue({ width: 2508, height: 2508 }),
  // PNG 6 MB, JPEGs scale with quality / size — enough to check the labels
  exportCard: jest.fn((_canvas, preset) => {
    const bytes = preset.type === 'image/png' ? 6 * 1024 * 1024 : preset.size ? 300 * 1024 : 2 * 1024 * 1024
    return Promise.resolve({ size: bytes } as Blob)
  }),
}))

const mockGenerateCard = generateCardModule.renderCard as jest.Mock
const mockExportCard = generateCardModule.exportCard as jest.Mock

describe('CardGenerator', () => {
  beforeEach(() => {
    mockGenerateCard.mockClear()
    mockExportCard.mockClear()
  })

  it('renders form fields and generate button', () => {
    render(<CardGenerator />)
    expect(screen.getByPlaceholderText('Prénom Nom')).toBeInTheDocument()
    expect(screen.getByText(/glisse ta photo ou ton logo/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /générer/i })).toBeInTheDocument()
  })

  it('generate button is disabled when fields are incomplete', () => {
    render(<CardGenerator />)
    const btn = screen.getByRole('button', { name: /générer/i })
    expect(btn).toBeDisabled()
  })

  it('does not call generateCard when button is not clicked', async () => {
    render(<CardGenerator />)
    fireEvent.change(screen.getByPlaceholderText('Prénom Nom'), {
      target: { value: 'Alice' },
    })
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, file)
    // Fields filled but button not clicked — no generation
    expect(mockGenerateCard).not.toHaveBeenCalled()
  })

  it('calls generateCard when button is clicked with all fields filled', async () => {
    render(<CardGenerator />)
    fireEvent.change(screen.getByPlaceholderText('Prénom Nom'), {
      target: { value: 'Alice' },
    })
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, file)
    await userEvent.click(screen.getByRole('button', { name: /générer/i }))
    await waitFor(() => expect(mockGenerateCard).toHaveBeenCalledTimes(1))
  })

  it('rejects files larger than 10MB', async () => {
    render(<CardGenerator />)
    const bigFile = new File(['x'], 'big.jpg', { type: 'image/jpeg' })
    Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, bigFile)
    expect(await screen.findByText(/trop lourde/i)).toBeInTheDocument()
  })

  it('offers a variety of fonts and passes the chosen one to generateCard', async () => {
    render(<CardGenerator />)
    const fonts = screen.getAllByRole('radio').filter((el) => el.tagName === 'BUTTON' && !el.getAttribute('aria-label'))
    expect(fonts.length).toBeGreaterThanOrEqual(8)

    fireEvent.change(screen.getByPlaceholderText('Prénom Nom'), { target: { value: 'Alice' } })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, new File(['img'], 'photo.jpg', { type: 'image/jpeg' }))
    await userEvent.click(screen.getByText('Signature'))
    await userEvent.click(screen.getByRole('button', { name: /générer/i }))
    await waitFor(() => expect(mockGenerateCard).toHaveBeenCalledWith(expect.objectContaining({ fontKey: 'kaushan' })))
  })

  it('lets the user pick the download quality and shows each file size', async () => {
    render(<CardGenerator />)
    fireEvent.change(screen.getByPlaceholderText('Prénom Nom'), { target: { value: 'Alice' } })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, new File(['img'], 'photo.jpg', { type: 'image/jpeg' }))
    await userEvent.click(screen.getByRole('button', { name: /générer/i }))

    // PNG is the default choice
    expect(await screen.findByRole('button', { name: /télécharger · png · 6 mo/i })).toBeInTheDocument()
    expect(screen.getAllByText('2508×2508px')).toHaveLength(3)
    expect(screen.getByText('1080×1080px')).toBeInTheDocument()
    expect(screen.getByText('300 Ko')).toBeInTheDocument()
    expect(mockExportCard).toHaveBeenCalledTimes(4)

    await userEvent.click(screen.getByRole('radio', { name: /jpeg léger/i }))
    expect(screen.getByRole('button', { name: /télécharger · jpg · 300 ko/i })).toBeInTheDocument()
  })

  it('shows download button only after generation', async () => {
    render(<CardGenerator />)
    expect(screen.queryByText(/télécharger/i)).not.toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Prénom Nom'), {
      target: { value: 'Alice' },
    })
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, file)
    await userEvent.click(screen.getByRole('button', { name: /générer/i }))

    await waitFor(() => {
      expect(screen.getByText(/télécharger/i)).toBeInTheDocument()
    })
  })
})
