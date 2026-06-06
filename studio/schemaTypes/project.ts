import {defineField, defineType} from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description: 'Required — project name shown in the card.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      title: 'Description',
      description: 'Required — 1–2 sentence project summary.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'techStack',
      type: 'array',
      of: [{type: 'string'}],
      title: 'Tech Stack',
      description: 'Required — at least one item (e.g. "React", "TypeScript").',
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      title: 'Image',
      description: 'Required — project screenshot or cover image.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'liveUrl',
      type: 'url',
      title: 'Live URL',
      description: 'Optional — live site URL (leave blank if not deployed).',
    }),
    defineField({
      name: 'githubUrl',
      type: 'url',
      title: 'GitHub URL',
      description: 'Required — link to the project repository.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'note',
      type: 'string',
      title: 'Note',
      description: 'Optional — e.g. "Built with a 6-person team (SoftServe IT Academy)".',
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'Order',
      description: 'Required — integer, positive. Lower numbers appear first (1 = first).',
      validation: (r) => r.required().integer().positive(),
    }),
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
})
