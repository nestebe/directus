import useCollection from '@/composables/use-collection';
import useItems from '@/composables/use-items';
import { useRelationsStore } from '@/stores';
import { getRelationType } from '@/utils/get-relation-type';
import { ref, computed, Ref } from 'vue';

export function useGroups(collection: Ref<string | null>, groupField: Ref<string | null>, groupTitle: Ref<string | null>) {
    const relationsStore = useRelationsStore();

    const relatedCollection = computed(() => {
        const field = groupField.value
        if(field === null) return null
        const relation = relationsStore.relations.find(relation => getRelationType({relation, collection: collection.value, field}) === 'm2o')
        if(relation === undefined || relation.related_collection === null) return null
        return relation.related_collection
    })

    const { info, fields, primaryKeyField } = useCollection(relatedCollection);

    const groupTitleFields = computed(() => {
        return fields.value.filter(field => field.type === 'string' || field.type === 'text')
    });

    const groupFieldsToLoad = computed(() => {
        if(primaryKeyField.value === null || groupTitle.value === null) return []
        return [primaryKeyField.value?.field, groupTitle.value]
    })

    const { items, loading, error } = useItems(
        relatedCollection,
        {
            sort: ref(''),
            limit: ref(100),
            page: ref(1),
            fields: groupFieldsToLoad,
            filters: ref([]),
            searchQuery: ref(null),
        }
    );

    return {relatedCollection, info, fields, primaryKeyField, groupTitleFields, items, loading, error}
}