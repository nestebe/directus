export type LayoutOptions = {
	groupField: string;
	groupTitle: string;
	icon?: string;
	imageSource?: string;
	title?: string;
	text?: string;
	imageFit?: 'crop' | 'contain';
};

export type LayoutQuery = {
	fields?: string[];
	sort?: string;
	limit?: number;
	page?: number;
};

export type Group = {
	id: string | number,
	title: string,
	items: Item[]
}

export type Item = {
	id: string | number,
	title?: string,
	text?: string,
	image?: string,
	item: Record<string, any>
}