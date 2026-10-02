import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Vanta Site Content',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Internal title',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      initialValue: { current: 'home' },
      validation: (Rule) => Rule.required()
    }),
    defineField({ name: 'heroEyebrow', title: 'Hero eyebrow', type: 'string' }),
    defineField({ name: 'heroTitle', title: 'Hero title', type: 'string' }),
    defineField({ name: 'heroText', title: 'Hero text', type: 'text', rows: 3 }),
    defineField({ name: 'primaryCta', title: 'Primary button text', type: 'string' }),
    defineField({ name: 'secondaryCta', title: 'Secondary button text', type: 'string' }),
    defineField({
      name: 'trustBadges',
      title: 'Trust badges',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (Rule) => Rule.max(4)
    }),
    defineField({ name: 'servicesEyebrow', title: 'Services eyebrow', type: 'string' }),
    defineField({ name: 'servicesTitle', title: 'Services title', type: 'string' }),
    defineField({ name: 'servicesText', title: 'Services text', type: 'text', rows: 3 }),
    defineField({
      name: 'services',
      title: 'Service cards',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 3, validation: (Rule) => Rule.required() })
          ]
        })
      ],
      validation: (Rule) => Rule.max(6)
    }),
    defineField({ name: 'workflowEyebrow', title: 'Workflow eyebrow', type: 'string' }),
    defineField({ name: 'workflowTitle', title: 'Workflow title', type: 'string' }),
    defineField({ name: 'workflowText', title: 'Workflow text', type: 'text', rows: 3 }),
    defineField({
      name: 'steps',
      title: 'Workflow steps',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required() }),
            defineField({ name: 'text', title: 'Text', type: 'text', rows: 2, validation: (Rule) => Rule.required() })
          ]
        })
      ],
      validation: (Rule) => Rule.max(5)
    }),
    defineField({ name: 'orderEyebrow', title: 'Order eyebrow', type: 'string' }),
    defineField({ name: 'orderTitle', title: 'Order title', type: 'string' }),
    defineField({ name: 'orderText', title: 'Order intro text', type: 'text', rows: 3 }),
    defineField({ name: 'contactEyebrow', title: 'Contact eyebrow', type: 'string' }),
    defineField({ name: 'contactTitle', title: 'Contact title', type: 'string' }),
    defineField({ name: 'contactText', title: 'Contact text', type: 'text', rows: 3 }),
    defineField({ name: 'footerText', title: 'Footer text', type: 'string' })
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' }
  }
});
