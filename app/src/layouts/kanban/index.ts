import { defineLayout } from '@directus/shared/utils';
import KanbanLayout from './kanban.vue';
import KanbanOptions from './options.vue';
import KanbanSidebar from './sidebar.vue';
import KanbanActions from './actions.vue';

import { useI18n } from 'vue-i18n';
import { Group, LayoutOptions, LayoutQuery } from './types';
import useSync from '@/composables/use-sync';
import useCollection from '@/composables/use-collection';
import useItems from '@/composables/use-items';
import { ref, computed, toRefs } from 'vue';
import { useFieldsStore, useRelationsStore } from '@/stores';
import { getFieldsFromTemplate } from '@/utils/get-fields-from-template';
import adjustFieldsForDisplays from '@/utils/adjust-fields-for-displays';
import { getRelationType } from '@/utils/get-relation-type';
import { Filter, Item } from '@directus/shared/types';
import { useGroups } from './useGroups';

export default defineLayout<LayoutOptions, LayoutQuery>({
	id: 'kanban',
	name: '$t:layouts.kanban.kanban',
	icon: 'view_week',
	component: KanbanLayout,
	slots: {
		options: KanbanOptions,
		sidebar: KanbanSidebar,
		actions: KanbanActions,
	},
	setup(props, { emit }) {
		const { t, n } = useI18n();

		const relationsStore = useRelationsStore();
		const fieldsStore = useFieldsStore()

		const selection = useSync(props, 'selection', emit);
		const layoutOptions = useSync(props, 'layoutOptions', emit);
		const layoutQuery = useSync(props, 'layoutQuery', emit);
		const filters = useSync(props, 'filters', emit);
		const searchQuery = useSync(props, 'searchQuery', emit);

		const { collection } = toRefs(props);
		const { sort, limit, page, fields } = useLayoutQuery();
		const { info, primaryKeyField, fields: fieldsInCollection, sortField } = useCollection(collection);

		const textFields = computed(() => {
			return fieldsInCollection.value.filter((field) => field.type === 'string' || field.type === 'text');
		});

		const groupFields = computed(() => {
			return fieldsInCollection.value.filter((field) => {
				const relation = relationsStore.relations.find((relation) => getRelationType({relation, collection: collection.value, field: field.field}) === 'm2o');
				return !!relation;
			});
		});

		const fileFields = computed(() => {
			return fieldsInCollection.value.filter((field) => {
				if (field.field === '$thumbnail') return true;

				const relation = relationsStore.relations.find((relation) => {
					return (
						relation.collection === props.collection &&
						relation.field === field.field &&
						relation.related_collection === 'directus_files'
					);
				});

				return !!relation;
			});
		});


		const { groupField, groupTitle, icon, imageSource, title, text, imageFit } = useLayoutOptions();

		const { items, loading, error, totalPages, itemCount, totalCount, changeManualSort, getItems } = useItems(
			collection,
			{
				sort,
				limit,
				page,
				fields,
				filters: filters,
				searchQuery: searchQuery,
			}
		);

		const groupedItems = computed<Group[]>(() => {
			const gpkField = groupPrimaryKeyField.value?.field
			const titleField = groupTitle.value
			const group = groupField.value

			const pkField = primaryKeyField.value?.field

			if(pkField === undefined || gpkField === undefined || titleField === null || group === null) return []

			const itemGroups: Record<string | number, Group> = groups.value.reduce((acc, group) => {
				acc[group[gpkField]] = {id: group[gpkField], title: group[titleField], items: []}
				return acc
			}, {} as Record<string, any>)

			for(let item of items.value) {
				if(item[group] in itemGroups) itemGroups[item[group]].items.push({
					id: item[pkField],
					title: title.value ?? undefined,
					text: text.value ? item[text.value] : undefined,
					image: imageSource.value ? item[imageSource.value] : undefined,
					item
				})
			}

			return Object.values(itemGroups)
		})

		const {items: groups, groupTitleFields, primaryKeyField: groupPrimaryKeyField} = useGroups(collection, groupField, groupTitle)

		return {
			groupedItems,
			groupPrimaryKeyField,
			groups,
			fileFields,
			groupFields,
			groupTitle,
			groupTitleFields,
			groupField, icon, imageSource, title, text, imageFit,
			items,
			loading,
			error,
			totalPages,
			page,
			itemCount,
			totalCount,
			fieldsInCollection,
			fields,
			limit,
			primaryKeyField,
			info,
			sortField,
			changeManualSort,
			textFields
		};

		function useLayoutOptions() {
			const groupField = createViewOption<string | null>('groupField', null);
			const groupTitle = createViewOption<string | null>('groupTitle', null);
			const icon = createViewOption<string>('icon', 'box');
			const title = createViewOption<string | null>('title', null);
			const text = createViewOption<string | null>('text', null);
			const imageSource = createViewOption<string | null>('imageSource', fileFields.value[0]?.field ?? null);
			const imageFit = createViewOption<string>('imageFit', 'crop');

			return { groupField, groupTitle, icon, imageSource, title, text, imageFit };

			function createViewOption<T>(key: keyof LayoutOptions, defaultValue: any) {
				return computed<T>({
					get() {
						return layoutOptions.value?.[key] !== undefined ? layoutOptions.value?.[key] : defaultValue;
					},
					set(newValue: T) {
						layoutOptions.value = {
							...layoutOptions.value,
							[key]: newValue,
						};
					},
				});
			}
		}

		

		function useLayoutQuery() {
			const page = computed({
				get() {
					return layoutQuery.value?.page || 1;
				},
				set(newPage: number) {
					layoutQuery.value = {
						...(layoutQuery.value || {}),
						page: newPage,
					};
				},
			});

			const sort = computed({
				get() {
					return layoutQuery.value?.sort || primaryKeyField.value?.field || '';
				},
				set(newSort: string) {
					layoutQuery.value = {
						...(layoutQuery.value || {}),
						page: 1,
						sort: newSort,
					};
				},
			});

			const limit = computed({
				get() {
					return layoutQuery.value?.limit || 25;
				},
				set(newLimit: number) {
					layoutQuery.value = {
						...(layoutQuery.value || {}),
						page: 1,
						limit: newLimit,
					};
				},
			});

			const fields = computed<string[]>(() => {
				if (!primaryKeyField.value || !props.collection) return [];
				const fields = [primaryKeyField.value.field];

				if (imageSource.value) {
					fields.push(`${imageSource.value}.modified_on`);
					fields.push(`${imageSource.value}.type`);
					fields.push(`${imageSource.value}.filename_disk`);
					fields.push(`${imageSource.value}.storage`);
					fields.push(`${imageSource.value}.id`);
				}

				if (props.collection === 'directus_files' && imageSource.value === '$thumbnail') {
					fields.push('modified_on');
					fields.push('type');
				}

				if (sort.value) {
					const sortField = sort.value.startsWith('-') ? sort.value.substring(1) : sort.value;

					if (fields.includes(sortField) === false) {
						fields.push(sortField);
					}
				}

				if(groupField.value) {
					fields.push(groupField.value)
				}

				const titleSubtitleFields: string[] = [];

				if (title.value) {
					titleSubtitleFields.push(...getFieldsFromTemplate(title.value));
				}

				if (text.value) {
					fields.push(text.value);
				}

				return [...fields, ...adjustFieldsForDisplays(titleSubtitleFields, props.collection)];
			});

			return { sort, limit, page, fields };
		}
	},
});
