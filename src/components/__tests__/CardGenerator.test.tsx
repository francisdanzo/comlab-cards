import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CardGenerator from '@/components/CardGenerator'
import * as generateCardModule from '@/lib/generateCard'

jest.mock('@/lib/generateCard', () => ({
  ...jest.requireActual('@/lib/generateCard'),
  generateCard: jest.fn().mockResolvedValue('data:image/png;base64,abc'),
}))

const mockGenerateCard = generateCardModule.generateCard as jest.Mock

describe('CardGenerator', () => {
  beforeEach(() => {
    mockGenerateCard.mockClear()
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
