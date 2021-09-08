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
		<div class="type-label">{{ t('layouts.cards.image_source') }}</div>
		<v-select v-model="imageSourceSync" show-deselect item-value="field" item-text="name" :items="fileFields" />
	</div>

	<div class="field">
		<div class="type-label">{{ t('layouts.cards.title') }}</div>
		<v-field-template v-model="titleSync" :collection="collection" />
	</div>

	<div class="field">
		<div class="type-label">{{ t('layouts.cards.subtitle') }}</div>
		<v-select v-model="textSync" :items="textFields" item-value="field" item-text="name" show-deselect />
	</div>

	<v-detail class="field">
		<template #title>{{ t('layout_setup') }}</template>

		<div class="nested-options">
			<div class="field">
				<div class="type-label">{{ t('layouts.cards.image_fit') }}</div>
				<v-select
					v-model="imageFitSync"
					:disabled="imageSource === null"
					:items="[
						{
							text: t('layouts.cards.crop'),
							value: 'crop',
						},
						{
							text: t('layouts.cards.contain'),
							value: 'contain',
						},
					]"
				/>
			</div>

			<div class="field">
				<div class="type-label">{{ t('fallback_icon') }}</div>
				<interface-select-icon :value="icon" @input="iconSync = $event" />
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
		icon: {
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
		groupField: {
			type: String,
			default: null
		},
		groupTitle: {
			type: String,
			default: null
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
		imageFit: {
			type: String,
			required: true,
		},
	},
	emits: ['update:icon', 'update:imageSource', 'update:title', 'update:text', 'update:imageFit', 'update:groupField', 'update:groupTitle'],
	setup(props, { emit }) {
		const { t } = useI18n();

		const iconSync = useSync(props, 'icon', emit);
		const imageSourceSync = useSync(props, 'imageSource', emit);
		const titleSync = useSync(props, 'title', emit);
		const textSync = useSync(props, 'text', emit);
		const imageFitSync = useSync(props, 'imageFit', emit);
		const groupFieldSync = useSync(props, 'groupField', emit);
		const groupTitleSync = useSync(props, 'groupTitle', emit);

		return { t, iconSync, imageSourceSync, titleSync, textSync, imageFitSync, groupFieldSync, groupTitleSync };
	},
});
</script>

<style lang="scss" scoped>
@import '@/styles/mixins/form-grid';

.nested-options {
	@include form-grid;
}
</style>
