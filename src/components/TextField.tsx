import { useId, type InputHTMLAttributes } from 'react'
import { fieldClass, labelClass } from '@/lib/formStyles'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}

// label↔input은 htmlFor로, 에러/힌트는 aria-describedby로 연결해 입력 필드 이름이 에러 문구로 오염되지 않게 한다.
export const TextField = ({ label, error, hint, ...inputProps }: TextFieldProps) => {
  const id = useId()
  const descriptionId = `${id}-description`
  const description = error ?? hint

  return (
    <div className="text-left">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={description ? descriptionId : undefined}
        className={fieldClass(!!error)}
        {...inputProps}
      />
      {description && (
        <p
          id={descriptionId}
          className={`mt-1 text-sm ${error ? 'text-red-800 dark:text-red-300' : 'text-slate-600 dark:text-slate-300'}`}
        >
          {description}
        </p>
      )}
    </div>
  )
}
