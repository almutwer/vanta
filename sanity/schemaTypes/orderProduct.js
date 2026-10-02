import { defineArrayMember, defineField, defineType } from 'sanity';

const productKeys = [
  { title: 'أكياس ورقية مطبوعة', value: 'paper-bags' },
  { title: 'حقائب قماش دعائية', value: 'fabric-bags' },
  { title: 'حقائب دعائية فاخرة', value: 'promo-bags' }
];

export default defineType({
  name: 'orderProduct',
  title: 'Order Product Pricing',
  type: 'document',
  fields: [
    defineField({
      name: 'key',
      title: 'Product key',
      type: 'string',
      options: { list: productKeys, layout: 'dropdown' },
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'nameAr',
      title: 'Arabic name',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'minQuantity',
      title: 'Minimum quantity',
      type: 'number',
      initialValue: 50,
      validation: (Rule) => Rule.required().integer().min(1)
    }),
    defineField({
      name: 'setupFeeSdg',
      title: 'Setup fee in SDG',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(0)
    }),
    defineField({
      name: 'colorUnitFeeSdg',
      title: 'Color unit fee in SDG',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(0)
    }),
    defineField({
      name: 'tiers',
      title: 'Quantity tiers',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'min',
              title: 'Minimum quantity',
              type: 'number',
              validation: (Rule) => Rule.required().integer().min(1)
            }),
            defineField({
              name: 'unitSdg',
              title: 'Unit price in SDG',
              type: 'number',
              validation: (Rule) => Rule.required().integer().min(0)
            })
          ],
          preview: {
            select: { min: 'min', unit: 'unitSdg' },
            prepare({ min, unit }) {
              return { title: `من ${min || 0} قطعة`, subtitle: `${unit || 0} ج.س للوحدة` };
            }
          }
        })
      ],
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true
    })
  ],
  preview: {
    select: { title: 'nameAr', subtitle: 'key' }
  }
});
