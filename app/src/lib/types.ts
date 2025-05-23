export interface UserPicture {
	small: string;
	medium: string;
	large: string;
}

export interface UserNotifications {
	added_as_friend: boolean;
	added_to_group: boolean;
	expense_added: boolean;
	expense_updated: boolean;
	bills: boolean;
	payments: boolean;
	monthly_summary: boolean;
	announcements: boolean;
}

export interface User {
	id: number;
	first_name: string;
	last_name: string;
	picture: UserPicture;
	custom_picture: boolean;
	email: string;
	registration_status: string;
	force_refresh_at: string;
	locale: string;
	country_code: string;
	date_format: string;
	default_currency: string;
	default_group_id: number;
	notifications_read: string;
	notifications_count: number;
	notifications: UserNotifications;
}

export interface Balance {
	amount: string;
	currency_code: string;
}

export interface GroupMember
	extends Omit<
		User,
		"notifications" | "notifications_read" | "notifications_count"
	> {
	balance: Balance[];
}

export interface Debt {
	from: number;
	to: number;
	amount: string;
	currency_code: string;
}

export interface GroupAvatar {
	small: string;
	medium: string;
	large: string;
	xlarge: string;
	xxlarge: string;
	original: string | null;
}

export interface GroupTallAvatar {
	xlarge: string;
	large: string;
}

export interface GroupCoverPhoto {
	xxlarge: string;
	xlarge: string;
}

export interface Group {
	id: number;
	name: string;
	created_at: string;
	updated_at: string;
	members: GroupMember[];
	simplify_by_default: boolean;
	original_debts: Debt[];
	simplified_debts: Debt[];
	avatar: GroupAvatar;
	tall_avatar: GroupTallAvatar;
	custom_avatar: boolean;
	cover_photo: GroupCoverPhoto;
}

export interface InvoiceJob {
	jobId: string;
	groupId: string;
	userId: string;
	status: string;
	parsedResult: object | null;
	error: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface InvoiceItem {
	item: string;
	quantity: number;
	price: number;
}
