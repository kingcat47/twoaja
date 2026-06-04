import emailjs from '@emailjs/browser'

emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY)

export async function sendNudgeEmail(params: {
  toEmail: string
  toName: string
  fromName: string
  taskTitle: string
  deadline: string
}) {
  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    {
      to_email: params.toEmail,
      to_name: params.toName,
      from_name: params.fromName,
      task_title: params.taskTitle,
      deadline: params.deadline,
    }
  )
}
