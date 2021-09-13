export type LayoutOptions = {
	groupField: string;
	groupTitle: string;
	dateField: string;
	tagsField?: string;
	imageSource?: string;
	title?: string;
	text?: string;
	crop: boolean;
};

export type LayoutQuery = {
	fields?: string[];
	sort?: string;
	limit?: number;
	page?: number;
};

export type Group = {
	id: string | number;
	title: string;
	items: Item[];
};

export type Item = {
	id: string | number;
	title?: string;
	text?: string;
	image?: string;
	date?: string;
	dateType?: string;
	tags?: string;
	item: Record<string, any>;
};


export type ChangeEvent = {
	added?: {
		element: Item,
		newIndex: number,
	},
	removed?: {
		element: Item,
		newIndex: number,
	},
	moved?: {
		element: Item,
		newIndex: number,
	}
}