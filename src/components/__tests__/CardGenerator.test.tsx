import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
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
    await userEvent.click(screen.getByRole('radio', { name: 'Startup' }))
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
    await userEvent.click(screen.getByRole('radio', { name: 'Startup' }))
    await userEvent.click(screen.getByRole('button', { name: /générer/i }))
    await waitFor(() => expect(mockGenerateCard).toHaveBeenCalledWith(expect.objectContaining({ fontKey: 'kaushan' })))
  })

  it('opens the visual in an overlay, then shows quality choices with sizes on download', async () => {
    render(<CardGenerator />)
    fireEvent.change(screen.getByPlaceholderText('Prénom Nom'), { target: { value: 'Alice' } })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, new File(['img'], 'photo.jpg', { type: 'image/jpeg' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Startup' }))
    await userEvent.click(screen.getByRole('button', { name: /générer/i }))

    const dialog = await screen.findByRole('dialog', { name: /ton visuel est prêt/i })
    expect(within(dialog).getByAltText('Visuel généré')).toBeInTheDocument()
    // Quality list is hidden until the user asks to download
    expect(within(dialog).queryByText('1080×1080px')).not.toBeInTheDocument()

    await userEvent.click(within(dialog).getByRole('button', { name: /^télécharger$/i }))
    expect(screen.getByRole('dialog', { name: /choisis la qualité/i })).toBeInTheDocument()
    await waitFor(() => expect(within(dialog).queryByText('calcul…')).not.toBeInTheDocument())
    expect(within(dialog).getByRole('button', { name: /png qualité maximale.*6 mo/i })).toBeInTheDocument()
    expect(within(dialog).getAllByText('2508×2508px')).toHaveLength(3)
    expect(within(dialog).getByText('1080×1080px')).toBeInTheDocument()
    expect(within(dialog).getByText('300 Ko')).toBeInTheDocument()
    expect(mockExportCard).toHaveBeenCalledTimes(4)

    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    await userEvent.click(within(dialog).getByRole('button', { name: /jpeg léger/i }))
    expect(click).toHaveBeenCalledTimes(1)
    expect((click.mock.instances[0] as unknown as HTMLAnchorElement).download).toBe('comlab-membre-alice-jpeg-light.jpg')
    click.mockRestore()
  })

  it('requires a role and passes it to the renderer', async () => {
    render(<CardGenerator />)
    fireEvent.change(screen.getByPlaceholderText('Prénom Nom'), { target: { value: 'Alice' } })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, new File(['img'], 'photo.jpg', { type: 'image/jpeg' }))
    const btn = screen.getByRole('button', { name: /générer/i })
    expect(btn).toBeDisabled()

    for (const label of ['Startup', 'Talent', 'Company', 'Professionnel', 'Institution Académique', 'ONG', 'Institution Gouvernementale']) {
      expect(screen.getByRole('radio', { name: label })).toBeInTheDocument()
    }
    await userEvent.click(screen.getByRole('radio', { name: 'Institution Gouvernementale' }))
    expect(btn).toBeEnabled()
    await userEvent.click(btn)
    await waitFor(() =>
      expect(mockGenerateCard).toHaveBeenCalledWith(expect.objectContaining({ role: 'Institution Gouvernementale' }))
    )
  })

  it('closes the overlay with Escape', async () => {
    render(<CardGenerator />)
    fireEvent.change(screen.getByPlaceholderText('Prénom Nom'), { target: { value: 'Alice' } })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, new File(['img'], 'photo.jpg', { type: 'image/jpeg' }))
    await userEvent.click(screen.getByRole('radio', { name: 'Startup' }))
    await userEvent.click(screen.getByRole('button', { name: /générer/i }))
    await screen.findByRole('dialog')
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    // Can be reopened from the preview panel
    await userEvent.click(screen.getByRole('button', { name: /ouvrir et télécharger/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
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
    await userEvent.click(screen.getByRole('radio', { name: 'Startup' }))
    await userEvent.click(screen.getByRole('button', { name: /générer/i }))

    expect(await screen.findByRole('button', { name: /^télécharger$/i })).toBeInTheDocument()
  })
})
