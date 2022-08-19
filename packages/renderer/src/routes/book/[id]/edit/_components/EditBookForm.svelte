<script lang="ts">
  import { onMount } from 'svelte';
  import { createForm } from 'svelte-forms-lib';
  import * as yup from 'yup';

  import Autocomplete from '/@/components/Autocomplete.svelte';
  import Button from '/@/components/Button.svelte';
  import DatePicker from '/@/components/DatePicker.svelte';
  import Form from '/@/components/Form.svelte';
  import FormControlLabel from '/@/components/FormControlLabel.svelte';
  import FormGroup from '/@/components/FormGroup.svelte';
  import Select from '/@/components/Select.svelte';
  import TextField from '/@/components/TextField.svelte';
  import {
    date2String,
    findNextMissingNumber,
    parseString2Array,
    string2Date
  } from '/@/util';

  export let book: Book | undefined;
  export let authors: Author[];
  export let languages: Language[];
  export let publishers: Publisher[];
  export let series: Series[];
  export let tags: Tag[];
  export let authorIds: string[];
  export let seriesId: string | undefined;
  export let language: string | undefined;
  export let onCancel: () => void;
  export let onSubmit: (metaData: EditBookFormData) => void;

  function getOptionalFormField(value: string | null) {
    if (value === null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed !== '' ? trimmed : null;
  }

  const referredAuthor = authorIds.map(authorId => authors.find(({ id }) => (
    id === authorId
  ))?.name ?? '').filter(Boolean).join(', ');

  const referredSeries = seriesId ? series.find(({ id }) => (
    id === seriesId
  ))?.name : '';

  const {
    errors,
    form,
    handleChange,
    handleSubmit,
    state,
    touched,
    updateField,
    updateTouched,
    updateValidateField,
    validateField
  } = createForm({
    initialValues: {
      title: book?.title ?? '',
      authors: book?.authors.join(', ') ?? referredAuthor ?? '',
      tags: book?.tags.join(', ') ?? '',
      description: book?.description ?? '',
      series: book?.series?.name ?? referredSeries ?? '',
      volume: book?.series ? book.series.volume.number + 1 : null,
      publisher: book?.publisher ?? '',
      published: book?.published ? date2String(book.published) : null,
      language: languages.find(({ id }) => (
        id === (book?.language?.id ?? language ?? 'und')
      ))!
    },
    onSubmit: async ({
      authors,
      tags,
      description,
      series,
      volume,
      publisher,
      published,
      language,
      ...values
    }) => {
      if (parseString2Array(authors).length === 0) {
        updateValidateField('authors', '');
        return false;
      }

      onSubmit({
        authors: parseString2Array(authors),
        description: getOptionalFormField(description),
        publisher: getOptionalFormField(publisher),
        published: published ? string2Date(published) : null,
        language: { id: language.id },
        series: (series === null || series.trim() === '') ? null : {
          name: series.trim(),
          volume: Number(volume) - 1
        },
        tags: parseString2Array(tags),
        ...values
      });
    },
    validationSchema: yup.object().shape({
      title: yup.string().trim().required(),
      authors: yup.string().trim().required(),
      tags: yup.string().optional(),
      description: yup.string().nullable().optional(),
      series: yup.string().nullable().optional(),
      volume: yup.number().when('series', {
        is: (series: string | null) => series,
        then: schema => (
          schema.typeError(
            'Please enter a number'
          ).integer(
            'Only integers are allowed'
          ).min(1, 'Volumes start at 1').nullable().required('Please enter a volume')
        ),
        otherwise: schema => schema.transform(value => (
          isNaN(value) ? undefined : value
        )).nullable().optional()
      }),
      publisher: yup.string().nullable().optional(),
      published: yup.string().nullable().optional(),
      language: yup.object().shape({
        id: yup.string().required()
      })
    })
  });

  function toLanguageError(x: string) {
    return x as unknown as { id: string };
  }

  function toLanguageTouched(x: boolean) {
    return x as unknown as { id: boolean };
  }

  let volumes: Volume[] = [];

  onMount(async () => {
    volumes = await window.scrapbookApi.getVolumes(
      series.find(({ name }) => name === $state.form.series)?.id ?? ''
    );

    if (referredSeries) {  // Set initial volume to next consecutive
      updateField(
        'volume',
        findNextMissingNumber(volumes.map(({ number }) => number)) + 1
      );
    }
  });
</script>

<Form onSubmit={handleSubmit}>
  <FormGroup row>
    <FormGroup>
      <FormControlLabel
        name="title"
        label="Title"
        error={$errors.title}
        touched={$touched.title}
      >
        <TextField
          bind:value={$form.title}
          onChange={handleChange}
          name="title"
          placeholder="Title"
          width="100%"
        />
      </FormControlLabel>

      <FormControlLabel
        name="authors"
        label="Author(s)"
        error={$errors.authors}
        touched={$touched.authors}
      >
        <Autocomplete
          bind:value={$form.authors}
          options={authors}
          getOptionLabel={option => option.name}
          multiple
          searchOptions={{ keys: ['name'] }}
          freeSolo
          filterSelectedOptions
          name="authors"
          placeholder="Author 1, Author 2, ..."
          on:change={handleChange}
        />
      </FormControlLabel>

      <FormControlLabel
        name="tags"
        label="Tags"
        error={$errors.tags}
        touched={$touched.tags}
      >
        <Autocomplete
          bind:value={$form.tags}
          options={tags}
          getOptionLabel={option => option.name}
          multiple
          searchOptions={{ keys: ['name'] }}
          freeSolo
          filterSelectedOptions
          disableCloseOnSelect
          name="tags"
          placeholder="Tag 1, Tag 2, ..."
          on:change={handleChange}
        />
      </FormControlLabel>

      <FormControlLabel
        name="description"
        label="Description"
        error={$errors.description}
        touched={$touched.description}
      >
        <TextField
          bind:value={$form.description}
          onChange={handleChange}
          name="description"
          placeholder="Short description"
          rows={6}
        />
      </FormControlLabel>
    </FormGroup>

    <FormGroup>
      <FormControlLabel
        name="series"
        label="Series"
        error={$errors.series}
        touched={$touched.series}
      >
        <Autocomplete
          bind:value={$form.series}
          options={series}
          getOptionLabel={option => option.name}
          searchOptions={{ keys: ['name'] }}
          freeSolo
          name="series"
          placeholder="Series"
          on:change={async event => {
            handleChange(event);

            volumes = await window.scrapbookApi.getVolumes(
              series.find(({ name }) => name === $state.form.series)?.id ?? ''
            );

            if ($touched.volume) {
              validateField('volume');
            }
          }}
        />
      </FormControlLabel>

      <FormControlLabel
        name="volume"
        label="Volume"
        error={$errors.volume}
        touched={$touched.volume}
      >
        <Autocomplete
          bind:value={$form.volume}
          options={volumes.map(volume => ({
            ...volume,
            number: volume.number + 1
          }))}
          getOptionLabel={option => String(option.number)}
          searchOptions={{ keys: ['number'] }}
          freeSolo
          disabled={$form.series === null || $form.series.trim() === ''}
          name="volume"
          placeholder="Number"
          on:change={handleChange}
        />
      </FormControlLabel>

      <FormControlLabel
        name="published"
        label="Published"
        error={$errors.published}
        touched={$touched.published}
      >
        <DatePicker
          bind:value={$form.published}
          on:change={handleChange}
          name="published"
        />
      </FormControlLabel>

      <FormControlLabel
        name="publisher"
        label="Publisher"
        error={$errors.publisher}
        touched={$touched.publisher}
      >
        <Autocomplete
          bind:value={$form.publisher}
          options={publishers}
          getOptionLabel={option => option.name}
          searchOptions={{ keys: ['name'] }}
          freeSolo
          name="publisher"
          placeholder="Publisher"
          on:change={handleChange}
        />
      </FormControlLabel>

      <FormControlLabel
        name="language"
        label="Language"
        error={toLanguageError($errors.language).id}
        touched={toLanguageTouched($touched.language).id}
      >
        <Select
          options={languages}
          bind:value={$form.language}
          name="language"
          getOptionLabel={option => option.name}
          isOptionEqualToValue={(option, value) => option.id === value.id}
        />
      </FormControlLabel>
    </FormGroup>
  </FormGroup>

  <div class="flex justify-end gap-8 mt-12">
    <Button onClick={onCancel}>
      Cancel
    </Button>

    <Button
      type="submit"
      variant="contained"
      color="primary"
      onClick={() => {
        updateTouched('authors', true);
        updateTouched('title', true);
      }}
    >
      Save
    </Button>
  </div>
</Form>
