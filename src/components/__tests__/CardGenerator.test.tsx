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

  it('renders form fields', () => {
    render(<CardGenerator templateType="attendee" />)
    expect(screen.getByPlaceholderText('Prénom Nom')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText(/clique ou glisse/i)).toBeInTheDocument()
  })

  it('shows custom domain input when "Autre" is selected', async () => {
    render(<CardGenerator templateType="attendee" />)
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'Autre')
    expect(screen.getByPlaceholderText(/précise ton domaine/i)).toBeInTheDocument()
  })

  it('hides custom domain input for non-Autre domain', async () => {
    render(<CardGenerator templateType="attendee" />)
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'Designer')
    expect(screen.queryByPlaceholderText(/précise ton domaine/i)).not.toBeInTheDocument()
  })

  it('does not call generateCard when fields are incomplete', () => {
    render(<CardGenerator templateType="attendee" />)
    fireEvent.change(screen.getByPlaceholderText('Prénom Nom'), {
      target: { value: 'Alice' },
    })
    expect(mockGenerateCard).not.toHaveBeenCalled()
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

  it('shows download button only when preview is available', async () => {
    render(<CardGenerator templateType="speaker" />)
    expect(screen.queryByText(/télécharger/i)).not.toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Prénom Nom'), {
      target: { value: 'Alice' },
    })
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'Designer')
    const file = new File(['img'], 'photo.jpg', { type: 'image/jpeg' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(screen.getByText(/télécharger/i)).toBeInTheDocument()
    })
  })
})
