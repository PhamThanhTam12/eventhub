import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, Button, Col, Form, Row } from "react-bootstrap";
import FormField from "./FormField";
import { fromVietnamDateInput, toVietnamDateInput } from "../utils/formatters";

const defaultCategories = [
  "Công nghệ", "Nghề nghiệp", "Âm nhạc", "Thể thao", "Cộng đồng", "Khác",
];

export default function EventForm({ event, onSubmit, onCancel }) {
  const [submitError, setSubmitError] = useState("");
  const categories = [...new Set([...defaultCategories, event?.category].filter(Boolean))];

  const formik = useFormik({
    initialValues: {
      title: event?.title || "",
      description: event?.description || "",
      image: event?.image || "",
      category: event?.category || "Công nghệ",
      startAt: toVietnamDateInput(event?.startAt),
      location: event?.location || "",
      price: event?.price ?? 0,
      capacity: event?.capacity ?? 50,
    },
    validationSchema: Yup.object({
      title: Yup.string().trim().required("Vui lòng nhập tên sự kiện.")
        .min(3, "Tên cần ít nhất 3 ký tự.").max(120, "Tên tối đa 120 ký tự."),
      description: Yup.string().trim().required("Vui lòng nhập mô tả.")
        .min(10, "Mô tả cần ít nhất 10 ký tự."),
      image: Yup.string().trim().required("Vui lòng nhập URL ảnh.")
        .url("URL ảnh không hợp lệ.")
        .matches(/^https?:\/\//i, "URL ảnh phải bắt đầu bằng http:// hoặc https://."),
      category: Yup.string().trim().required("Vui lòng chọn chủ đề.").max(60),
      startAt: Yup.string().required("Vui lòng chọn thời gian bắt đầu.")
        .test("valid-date", "Thời gian không hợp lệ.",
          (value) => !value || Boolean(fromVietnamDateInput(value))),
      location: Yup.string().trim().required("Vui lòng nhập địa điểm.")
        .min(2, "Địa điểm cần ít nhất 2 ký tự.").max(200, "Địa điểm tối đa 200 ký tự."),
      price: Yup.number().typeError("Giá vé phải là số.")
        .required("Vui lòng nhập giá vé.").integer("Giá vé phải là số nguyên.")
        .min(0, "Giá vé không được âm."),
      capacity: Yup.number().typeError("Sức chứa phải là số.")
        .required("Vui lòng nhập sức chứa.").integer("Sức chứa phải là số nguyên.")
        .min(1, "Sức chứa cần ít nhất 1 người."),
    }),
    onSubmit: async (values) => {
      setSubmitError("");

      try {
        await onSubmit({
          title: values.title.trim(),
          description: values.description.trim(),
          image: values.image.trim(),
          category: values.category.trim(),
          startAt: fromVietnamDateInput(values.startAt),
          location: values.location.trim(),
          price: Number(values.price),
          capacity: Number(values.capacity),
        });
      } catch (error) {
        setSubmitError(error.message || "Chưa lưu được sự kiện. Vui lòng thử lại.");
      }
    },
  });

  return (
    <Form noValidate onSubmit={formik.handleSubmit}>
      {submitError && <Alert variant="danger">{submitError}</Alert>}

      <fieldset disabled={formik.isSubmitting}>
        <FormField formik={formik} name="title" label="Tên sự kiện" type="text" maxLength={120} />

        <Row>
          <Col md={6}>
            <Form.Group controlId="field-category" className="mb-3">
              <Form.Label>Chủ đề</Form.Label>
              <Form.Select
                {...formik.getFieldProps("category")}
                isInvalid={Boolean(formik.touched.category && formik.errors.category)}
                aria-describedby="category-error"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Form.Select>
              <Form.Control.Feedback id="category-error" type="invalid">
                {formik.errors.category}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <FormField
              formik={formik}
              name="startAt"
              label="Thời gian bắt đầu (giờ Việt Nam)"
              type="datetime-local"
            />
          </Col>
        </Row>

        <FormField formik={formik} name="location" label="Địa điểm" type="text" maxLength={200} />
        <FormField
          formik={formik} name="image" label="URL ảnh" type="url"
          placeholder="https://..."
          help="Dùng đường dẫn trực tiếp đến ảnh sự kiện."
        />
        <FormField formik={formik} name="description" label="Mô tả" as="textarea" rows={4} />

        <Row>
          <Col md={6}>
            <FormField
              formik={formik} name="price" label="Giá vé (đồng)" type="number"
              min={0} step={1} help="Nhập 0 nếu sự kiện miễn phí."
            />
          </Col>
          <Col md={6}>
            <FormField
              formik={formik} name="capacity" label="Sức chứa" type="number"
              min={1} step={1}
            />
          </Col>
        </Row>

        <div className="d-flex justify-content-end gap-2">
          <Button type="button" variant="outline-secondary" onClick={onCancel}>
            Quay lại
          </Button>
          <Button type="submit">
            {formik.isSubmitting ? "Đang lưu..." : event ? "Lưu thay đổi" : "Tạo sự kiện"}
          </Button>
        </div>
      </fieldset>
    </Form>
  );
}
