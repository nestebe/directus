<template>
	<div class="field">
		<div class="type-label">{{ t('layouts.kanban.group_field') }}</div>
		<v-select v-model="groupFieldSync" show-deselect item-value="field" item-text="name" :items="groupFields" />
	</div>

	<div class="field">
		<div class="type-label">{{ t('layouts.kanban.group_title') }}</div>
		<v-select v-model="groupTitleSync" show-deselect item-value="field" item-text="name" :items="groupTitleFields" />
	</div>

	<div class="field">
		<div class="type-label">{{ t('layouts.kanban.image_source') }}</div>
		<v-select v-model="imageSourceSync" show-deselect item-value="field" item-text="name" :items="fileFields" />
	</div>

	<div class="field">
		<div class="type-label">{{ t('layouts.kanban.title') }}</div>
		<v-field-template v-model="titleSync" :collection="collection" />
	</div>

	<div class="field">
		<div class="type-label">{{ t('layouts.kanban.text') }}</div>
		<v-select v-model="textSync" :items="textFields" item-value="field" item-text="name" show-deselect />
	</div>

	<div class="field">
		<div class="type-label">{{ t('layouts.kanban.date') }}</div>
		<v-select v-model="dateFieldSync" :items="dateFields" item-value="field" item-text="name" show-deselect />
	</div>

	<div class="field">
		<div class="type-label">{{ t('layouts.kanban.tags') }}</div>
		<v-select v-model="tagsFieldSync" :items="tagsFields" item-value="field" item-text="name" show-deselect />
	</div>

	<v-detail class="field">
		<template #title>{{ t('layout_setup') }}</template>

		<div class="nested-options">
			<div class="field">
				<div class="type-label">{{ t('layouts.kanban.image_fit') }}</div>
				<v-checkbox v-model="cropSync" block :label="t('layouts.kanban.crop')" />
			</div>
		</div>
	</v-detail>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n';
import { defineComponent, PropType } from 'vue';

import { Field } from '@directus/shared/types';
import useSync from '@/composables/use-sync';

export default defineComponent({
	inheritAttrs: false,
	props: {
		collection: {
			type: String,
			required: true,
		},
		fileFields: {
			type: Array as PropType<Field[]>,
			required: true,
		},
		textFields: {
			type: Array as PropType<Field[]>,
			required: true,
		},
		groupFields: {
			type: Array as PropType<Field[]>,
			required: true,
		},
		groupTitleFields: {
			type: Array as PropType<Field[]>,
			required: true,
		},
		dateFields: {
			type: Array as PropType<Field[]>,
			required: true,
		},
		tagsFields: {
			type: Array as PropType<Field[]>,
			required: true,
		},
		groupField: {
			type: String,
			default: null,
		},
		groupTitle: {
			type: String,
			default: null,
		},
		imageSource: {
			type: String,
			default: null,
		},
		title: {
			type: String,
			default: null,
		},
		text: {
			type: String,
			default: null,
		},
		crop: {
			type: Boolean,
			required: true,
		},
		dateField: {
			type: String,
			default: null,
		},
		tagsField: {
			type: String,
			default: null,
		},
	},
	emits: [
		'update:imageSource',
		'update:title',
		'update:text',
		'update:crop',
		'update:groupField',
		'update:groupTitle',
		'update:dateField',
		'update:tagsField',
	],
	setup(props, { emit }) {
		const { t } = useI18n();

		const imageSourceSync = useSync(props, 'imageSource', emit);
		const titleSync = useSync(props, 'title', emit);
		const textSync = useSync(props, 'text', emit);
		const cropSync = useSync(props, 'crop', emit);
		const groupFieldSync = useSync(props, 'groupField', emit);
		const groupTitleSync = useSync(props, 'groupTitle', emit);
		const dateFieldSync = useSync(props, 'dateField', emit);
		const tagsFieldSync = useSync(props, 'tagsField', emit);

		return {
			t,
			imageSourceSync,
			titleSync,
			textSync,
			cropSync,
			groupFieldSync,
			groupTitleSync,
			dateFieldSync,
			tagsFieldSync,
		};
	},
});
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/form-grid';

.nested-options {
	@include form-grid;
}
</style>
