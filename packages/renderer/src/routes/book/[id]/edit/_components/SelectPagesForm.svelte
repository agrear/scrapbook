<script context="module" lang="ts">
  export type SelectPagesFormData = {
    range: (number | [number, number])[]
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
  export let onSubmit: (formData: SelectPagesFormData) => void;

  const {
    errors,
    form,
    handleChange,
    handleSubmit,
    touched,
    updateTouched
  } = createForm({
    initialValues: {
      range: ''
    },
    onSubmit: ({ range }) => {
      onSubmit({
        range: range.split(',').map(str => {
          const numbers = str.split('-').map(x => Number(x.trim()));
          return numbers.length === 1 ? numbers[0] : [numbers[0], numbers[1]];
        })
      });
    },
    validationSchema: yup.object().shape({
      range: yup.string().trim().matches(
        /^(\s*\d+\s*(-\s*\d+\s*)?)(,\s*\d+\s*(-\s*\d+\s*)?)*$/,
        'Invalid range selector'
      ).required()
    })
  });
</script>

<Form {id} onSubmit={handleSubmit}>
  <FormGroup>
    <FormControlLabel
      name="range"
      label="Selection"
      error={$errors.range}
      touched={$touched.range}
    >
      <TextField
        bind:value={$form.range}
        onChange={handleChange}
        name="range"
        placeholder="1, 3 - 5"
        width="100%"
      />
    </FormControlLabel>
  </FormGroup>
</Form>
