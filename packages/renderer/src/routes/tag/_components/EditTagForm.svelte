<script context="module" lang="ts">
  export type EditTagFormData = {
    id: string,
    name: string
  };
</script>

<script lang="ts">
  import { createForm } from 'svelte-forms-lib';
  import * as yup from 'yup';

  import Form from '/@/components/Form.svelte';
  import FormControlLabel from '/@/components/FormControlLabel.svelte';
  import FormGroup from '/@/components/FormGroup.svelte';
  import TextField from '/@/components/TextField.svelte';

  export let id: string;
  export let tag: Tag;
  export let tags: Tag[];
  export let onSubmit: (formData: EditTagFormData) => void;

  const {
    errors,
    form,
    handleChange,
    handleSubmit,
    touched,
    updateTouched
  } = createForm({
    initialValues: {
      name: tag.name
    },
    onSubmit: values => onSubmit({
      id: tag.id,
      ...values
    }),
    validationSchema: yup.object().shape({
      name: yup.string().trim().notOneOf(
        tags.filter(({ id }) => id !== tag.id).map(({ name }) => name),
        'Tag name already in use'
      ).required()
    })
  });
</script>

<Form {id} onSubmit={handleSubmit}>
  <FormGroup>
    <FormControlLabel
      name="name"
      label="Name"
      error={$errors.name}
      touched={$touched.name}
    >
      <TextField
        bind:value={$form.name}
        onChange={handleChange}
        name="name"
        placeholder="Name"
        width="100%"
      />
    </FormControlLabel>
  </FormGroup>
</Form>
