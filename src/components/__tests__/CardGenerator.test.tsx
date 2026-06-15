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
    render(<CardGenerator templateType="attendee" />)
    expect(screen.getByPlaceholderText('Prénom Nom')).toBeInTheDocument()
    expect(screen.getByText(/glisse ta photo/i)).toBeInTheDocument()
    expect(screen.getByText(/générer/i)).toBeInTheDocument()
  })

  it('generate button is disabled when fields are incomplete', () => {
    render(<CardGenerator templateType="attendee" />)
    const btn = screen.getByText(/générer/i).closest('button')!
    expect(btn).toBeDisabled()
  })

  it('does not call generateCard when button is not clicked', async () => {
    render(<CardGenerator templateType="attendee" />)
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
    render(<CardGenerator templateType="attendee" />)
    fireEvent.change(screen.getByPlaceholderText('Prénom Nom'), {
      target: { value: 'Alice' },
    })
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, file)
    await userEvent.click(screen.getByText(/générer/i))
    await waitFor(() => expect(mockGenerateCard).toHaveBeenCalledTimes(1))
  })

  it('rejects files larger than 10MB', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
    render(<CardGenerator templateType="attendee" />)
    const bigFile = new File(['x'], 'big.jpg', { type: 'image/jpeg' })
    Object.defineProperty(bigFile, 'size', { value: 11 * 1024 * 1024 })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, bigFile)
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('10MB'))
    alertSpy.mockRestore()
  })

  it('shows download button only after generation', async () => {
    render(<CardGenerator templateType="speaker" />)
    expect(screen.queryByText(/télécharger/i)).not.toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Prénom Nom'), {
      target: { value: 'Alice' },
    })
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, file)
    await userEvent.click(screen.getByText(/générer/i))

    await waitFor(() => {
      expect(screen.getByText(/télécharger/i)).toBeInTheDocument()
    })
  })
})
