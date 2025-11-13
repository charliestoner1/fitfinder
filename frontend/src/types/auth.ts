export interface User {
    id: number;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    user_type: 'regular' | 'shop_owner' | 'admin';
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    username: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
    user_type: 'regular' | 'shop_owner';
}

