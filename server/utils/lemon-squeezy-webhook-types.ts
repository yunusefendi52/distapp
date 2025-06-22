export type WebhookEvent = {
    meta: Meta | undefined;
    data: WebhookData | undefined;
}

export type WebhookData = {
    type: string;
    id: string;
    attributes: SubscriptionAttributes;
    relationships: Relationships;
    links: DataLinks;
    [key: string]: any;
}

export type SubscriptionAttributes = {
    store_id: number;
    customer_id: number;
    order_id: number;
    order_item_id: number;
    product_id: number;
    variant_id: number;
    product_name: string;
    variant_name: string;
    user_name: string;
    user_email: string;
    status: string;
    status_formatted: string;
    card_brand: string;
    card_last_four: string;
    pause: null;
    cancelled: boolean;
    trial_ends_at: null;
    billing_anchor: number;
    first_subscription_item: FirstSubscriptionItem | undefined;
    urls: Urls;
    renews_at: string | undefined;
    ends_at: null;
    created_at: string;
    updated_at: string;
    test_mode: boolean;
    subscription_id: number | undefined;
    [key: string]: any;
}

export type FirstSubscriptionItem = {
    subscription_id: number;
    price_id: number;
    quantity: number;
    created_at: string;
    updated_at: string;
}


export type Urls = {
    invoice_url: string;
}

export type DataLinks = {
    self: string;
}

export type Relationships = {
    store: Customer;
    subscription: Customer;
    customer: Customer;
}

export type Customer = {
    links: CustomerLinks;
}

export type CustomerLinks = {
    related: string;
    self: string;
}

export type Meta = {
    test_mode: boolean;
    event_name: string;
    custom_data: CustomData;
    webhook_id: string;
}

export type CustomData = {
    user_id: string;
    p_user_id: string;
}

export type NewSubscription = typeof tables.users_subs.$inferInsert
