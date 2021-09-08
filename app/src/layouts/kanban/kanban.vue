<template>
	<div class="kanban">
		<div class="group" v-for="group in groupedItems" :key="group.id">
			<div class="header">
				<div class="title">
					{{group.title}}
					<span class="badge">{{group.items.length}}</span>
				</div>
				<div class="actions">
					<v-icon name="add" />
					<v-icon name="more_horiz"/>
				</div>
			</div>
			<draggable :list="group.items" group="group" draggable=".item">
				<template #item="{ element }">
					<div class="item" >
						<render-template :collection="collection" :fields="fieldsInCollection" :item="element.item" :template="element.title" />
					</div>
				</template>
			</draggable>
		</div>
	</div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { defineComponent, PropType } from 'vue';
import { Field } from '@directus/shared/types';
import { Group } from './types';
import Draggable from 'vuedraggable'

export default defineComponent({
	components: { Draggable },
	inheritAttrs: false,
	props: {
		collection: {
			type: String,
			default: null
		},
		fieldsInCollection: {
			type: Array as PropType<Field[]>,
			default: () => []
		},
		primaryKeyField: {
			type: Object as PropType<Field>,
			default: null
		},
		groupedItems: {
			type: Array as PropType<Group[]>,
			default: () => []
		},
		groupTitle: {
			type: String,
			default: null
		},
		groupPrimaryKeyField: {
			type: Object as PropType<Field>,
			default: null
		}
	},
	emits: ['update:selection', 'update:limit', 'update:size', 'update:sort', 'update:width'],
	setup(props, { emit }) {
		const { t } = useI18n();

		return { t };
	},
});
</script>

<style lang="scss" scoped>
.kanban {
	display: flex;
	padding-left: 32px;

	.group {
		background-color: var(--background-normal);
		margin-right: 10px;
		padding: 8px;
		min-width: 240px;
		border-radius: var(--border-radius);
		border: 1px solid var(--border-normal);

		.header {
			font-weight: 700;
			display: flex;
			justify-content: space-between;

			.badge {
				display: inline-block;
			}
		}
	}
}
</style>
