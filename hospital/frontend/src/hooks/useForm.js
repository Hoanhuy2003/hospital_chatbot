import { useState } from 'react'

/**
 * Hook quản lý form: values, errors, validate
 * @param {object} initialValues - giá trị ban đầu
 * @param {function} validate - hàm nhận values, trả về object errors
 */
export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setValues(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    // Xoá lỗi khi người dùng gõ
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n })
    }
  }

  function handleSubmit(onSubmit) {
    return async (e) => {
      e.preventDefault()
      const errs = validate ? validate(values) : {}
      if (Object.keys(errs).length > 0) {
        setErrors(errs)
        return
      }
      setLoading(true)
      try {
        await onSubmit(values)
      } finally {
        setLoading(false)
      }
    }
  }

  function reset() {
    setValues(initialValues)
    setErrors({})
  }

  return { values, errors, loading, handleChange, handleSubmit, reset, setErrors }
}
