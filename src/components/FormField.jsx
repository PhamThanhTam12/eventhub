import { Form } from "react-bootstrap";

export default function FormField({ formik, name, label, help, ...controlProps }) {
  const id = "field-" + name;
  const invalid = Boolean(formik.touched[name] && formik.errors[name]);
  const describedBy = [
    help ? id + "-help" : null,
    invalid ? id + "-error" : null,
  ].filter(Boolean).join(" ") || undefined;

  return (
    <Form.Group controlId={id} className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        {...controlProps}
        {...formik.getFieldProps(name)}
        isInvalid={invalid}
        aria-describedby={describedBy}
      />
      <Form.Control.Feedback id={id + "-error"} type="invalid">
        {formik.errors[name]}
      </Form.Control.Feedback>
      {help && <Form.Text id={id + "-help"}>{help}</Form.Text>}
    </Form.Group>
  );
}
