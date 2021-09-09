<template>
	<div class="kanban">
		<div v-for="group in groupedItems" :key="group.id" class="group">
			<div class="header">
				<div class="title">
					{{ group.title }}
					<span class="badge">{{ group.items.length }}</span>
				</div>
				<div class="actions">
					<router-link :to="`${collection}/+`"><v-icon name="add" /></router-link>
					<v-menu show-arrow>
						<template #activator="{ toggle }">
							<v-icon name="more_horiz" clickable @click="toggle" />
						</template>

						<div>Option A</div>
						<div>Option B</div>
					</v-menu>
				</div>
			</div>
			<draggable :list="group.items" group="group" draggable=".item" class="items" item-key="id">
				<template #item="{ element }">
					<router-link :to="`${collection}/${element.id}`" class="item">
						<render-template
							:collection="collection"
							:fields="fieldsInCollection"
							:item="element.item"
							:template="element.title"
						/>
						<img v-if="element.image" :src="element.image" />
						<div v-if="element.text" class="text">{{ element.text }}</div>
						<display-labels
							v-if="element.tags"
							:value="element.tags"
							:type="Array.isArray(element.tags) ? 'csv' : 'json'"
						/>
						<display-datetime v-if="element.date" format="short" :value="element.date" :type="element.dateType" />
					</router-link>
				</template>
			</draggable>
		</div>
		<div class="spacer"></div>
	</div>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { defineComponent, PropType } from 'vue';
import { Field } from '@directus/shared/types';
import { Group } from './types';
import Draggable from 'vuedraggable';

export default defineComponent({
	components: { Draggable },
	inheritAttrs: false,
	props: {
		collection: {
			type: String,
			default: null,
		},
		fieldsInCollection: {
			type: Array as PropType<Field[]>,
			default: () => [],
		},
		primaryKeyField: {
			type: Object as PropType<Field>,
			default: null,
		},
		groupedItems: {
			type: Array as PropType<Group[]>,
			default: () => [],
		},
		groupTitle: {
			type: String,
			default: null,
		},
		groupPrimaryKeyField: {
			type: Object as PropType<Field>,
			default: null,
		},
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
	height: calc(100% - 65px - 2 * 24px);
	padding: 0px 0px 24px 32px;
	overflow-x: auto;
	overflow-y: hidden;

	.group {
		display: flex;
		flex-direction: column;
		min-width: 300px;
		margin-right: 20px;
		padding: 8px 16px;
		background-color: var(--background-normal);
		border: 1px solid var(--border-normal);
		border-radius: var(--border-radius);

		.header {
			display: flex;
			justify-content: space-between;
			margin-bottom: 8px;
			font-weight: 700;

			.badge {
				display: inline-flex;
				justify-content: center;
				width: 24px;
				height: 24px;
				text-align: center;
				background-color: var(--background-normal-alt);
				border-radius: 50%;
			}

			.actions {
				color: var(--foreground-subdued);

				& > .v-icon {
					margin-left: 8px;
				}
			}
		}

		.items {
			flex: 1;

			.item {
				display: block;
				margin-bottom: 6px;
				padding: 8px 16px;
				background-color: var(--background-page);
				border: 1px solid var(--border-normal);
				border-radius: var(--border-radius);
			}

			.render-template {
				font-weight: 700;
			}

			img {
				width: 100%;
				margin-top: 10px;
				border-radius: var(--border-radius);
				// height: 300px;
			}

			.display-labels {
				margin-top: 10px;
			}

			.datetime {
				display: inline-block;
				width: 100%;
				margin-top: 10px;
				color: var(--foreground-subdued);
				text-align: end;
			}
		}
	}

	.spacer {
		min-width: 12px;
		height: 100%;
	}
}
</style>
