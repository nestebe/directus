import { defineLayout } from '@directus/shared/utils';
import KanbanLayout from './kanban.vue';
import KanbanOptions from './options.vue';
import KanbanSidebar from './sidebar.vue';
import KanbanActions from './actions.vue';

import { useI18n } from 'vue-i18n';
import { ChangeEvent, Group, LayoutOptions, LayoutQuery } from './types';
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
import api, { addTokenToURL } from '@/api';
import { getRootPath } from '@/utils/get-root-path';

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
		const fieldsStore = useFieldsStore();

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

		const tagsFields = computed(() => {
			return fieldsInCollection.value.filter((field) => field.type === 'json' || field.type === 'csv');
		});

		const dateFields = computed(() => {
			return fieldsInCollection.value.filter((field) => ['date', 'time', 'dateTime', 'timestamp'].includes(field.type));
		});

		const groupFields = computed(() => {
			return fieldsInCollection.value.filter((field) => {
				const relation = relationsStore.relations.find(
					(relation) => getRelationType({ relation, collection: collection.value, field: field.field }) === 'm2o'
				);
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

		const { groupField, groupTitle, imageSource, title, text, crop, dateField, tagsField } = useLayoutOptions();
		const {
			items: groups,
			groupTitleFields,
			primaryKeyField: groupPrimaryKeyField,
		} = useGroups(collection, groupField, groupTitle);

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
			const gpkField = groupPrimaryKeyField.value?.field;
			const titleField = groupTitle.value;
			const group = groupField.value;

			const pkField = primaryKeyField.value?.field;

			if (pkField === undefined || gpkField === undefined || titleField === null || group === null) return [];

			const itemGroups: Record<string | number, Group> = groups.value.reduce((acc, group) => {
				acc[group[gpkField]] = { id: group[gpkField], title: group[titleField], items: [] };
				return acc;
			}, {} as Record<string, any>);

			for (const item of items.value) {
				if (item[group] in itemGroups)
					itemGroups[item[group]].items.push({
						id: item[pkField],
						title: title.value ?? undefined,
						text: text.value ? item[text.value] : undefined,
						image: imageSource.value ? parseUrl(item[imageSource.value]) : undefined,
						date: dateField.value ? item[dateField.value] : undefined,
						dateType: dateFields.value.find((field) => field.field === dateField.value)?.type,
						tags: tagsField.value ? item[tagsField.value] : undefined,
						item,
					});
			}

			return Object.values(itemGroups);
		});

		return {
			groupedItems,
			groupPrimaryKeyField,
			groups,
			fileFields,
			groupFields,
			groupTitle,
			groupTitleFields,
			groupField,
			imageSource,
			title,
			text,
			crop,
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
			textFields,
			dateField,
			dateFields,
			tagsField,
			tagsFields,
			change
		};

		function change(group: Group, event: ChangeEvent) {
			const pkField = primaryKeyField.value?.field
			const gField = groupField.value

			if(pkField === undefined || gField === null) return

			if(event.moved) {
				changeManualSort({item: group.items[event.moved.oldIndex].id, to: group.items[event.moved.newIndex].id})
			} else if(event.added) {
				const itemIndex = items.value.findIndex((item) => item[pkField] === event.added?.element.id)
				items.value[itemIndex][gField] = group.id

				api.patch(`/items/${collection.value}/${event.added.element.id}`, {
					[gField]: group.id
				})

				if(group.items.length > 0) {
					changeManualSort({item: event.added.element.id, to: group.items[event.added.newIndex].id})
				}
			}
		}

		function parseUrl(file: Record<string, any>) {
			if (!file || !file.type) return;
			if (file.type.startsWith('image') === false) return;
			if (file.type.includes('svg')) return;

			const fit = crop.value ? '&width=250&height=150' : `&key=system-medium-contain`;

			const url = getRootPath() + `assets/${file.id}?modified=${file.modified_on}` + fit;
			return addTokenToURL(url);
		}

		function useLayoutOptions() {
			const groupField = createViewOption<string | null>('groupField', groupFields.value[0]?.field ?? null);
			const groupTitle = createViewOption<string | null>('groupTitle', null);
			const dateField = createViewOption<string | null>('dateField', dateFields.value[0]?.field ?? null);
			const tagsField = createViewOption<string | null>('tagsField', tagsFields.value[0]?.field ?? null);
			const title = createViewOption<string | null>('title', null);
			const text = createViewOption<string | null>('text', null);
			const imageSource = createViewOption<string | null>('imageSource', fileFields.value[0]?.field ?? null);
			const crop = createViewOption<boolean>('crop', true);

			return { groupField, groupTitle, imageSource, title, text, crop, dateField, tagsField };

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

				[groupField.value, text.value, tagsField.value, dateField.value].forEach((val) => {
					if (val !== null) fields.push(val);
				});

				const titleSubtitleFields: string[] = [];

				if (title.value) {
					titleSubtitleFields.push(...getFieldsFromTemplate(title.value));
				}

				return [...fields, ...adjustFieldsForDisplays(titleSubtitleFields, props.collection)];
			});

			return { sort, limit, page, fields };
		}
	},
});
