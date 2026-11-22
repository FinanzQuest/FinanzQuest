export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[]

export type Database = {
	api: {
		Tables: {
			asset_prices: {
				Row: {
					asset_id: number
					close: number | null
					high: number | null
					low: number | null
					open: number | null
					tstamp: string
					volume: number | null
				}
				Insert: {
					asset_id: number
					close?: number | null
					high?: number | null
					low?: number | null
					open?: number | null
					tstamp: string
					volume?: number | null
				}
				Update: {
					asset_id?: number
					close?: number | null
					high?: number | null
					low?: number | null
					open?: number | null
					tstamp?: string
					volume?: number | null
				}
				Relationships: [
					{
						foreignKeyName: "assetprices_asset_id_fkey"
						columns: ["asset_id"]
						isOneToOne: false
						referencedRelation: "assets"
						referencedColumns: ["id"]
					},
				]
			}
			asset_prices_intraday: {
				Row: {
					asset_id: number
					close: number | null
					high: number | null
					low: number | null
					open: number | null
					tstamp: string
					volume: number | null
				}
				Insert: {
					asset_id: number
					close?: number | null
					high?: number | null
					low?: number | null
					open?: number | null
					tstamp: string
					volume?: number | null
				}
				Update: {
					asset_id?: number
					close?: number | null
					high?: number | null
					low?: number | null
					open?: number | null
					tstamp?: string
					volume?: number | null
				}
				Relationships: [
					{
						foreignKeyName: "asset_prices_intraday_asset_fkey"
						columns: ["asset_id"]
						isOneToOne: false
						referencedRelation: "assets"
						referencedColumns: ["id"]
					},
				]
			}
			assets: {
				Row: {
					asset_type: Database["public"]["Enums"]["assettype"]
					description: string | null
					id: number
					last_updated: string | null
					name: string
					price_provider: Database["public"]["Enums"]["priceprovider"] | null
					symbol: string
				}
				Insert: {
					asset_type: Database["public"]["Enums"]["assettype"]
					description?: string | null
					id?: number
					last_updated?: string | null
					name: string
					price_provider?: Database["public"]["Enums"]["priceprovider"] | null
					symbol: string
				}
				Update: {
					asset_type?: Database["public"]["Enums"]["assettype"]
					description?: string | null
					id?: number
					last_updated?: string | null
					name?: string
					price_provider?: Database["public"]["Enums"]["priceprovider"] | null
					symbol?: string
				}
				Relationships: []
			}
			latest_prices: {
				Row: {
					asset_id: number
					close: number
					tstamp: string
				}
				Insert: {
					asset_id: number
					close: number
					tstamp: string
				}
				Update: {
					asset_id?: number
					close?: number
					tstamp?: string
				}
				Relationships: [
					{
						foreignKeyName: "latest_prices_asset_fkey"
						columns: ["asset_id"]
						isOneToOne: true
						referencedRelation: "assets"
						referencedColumns: ["id"]
					},
				]
			}
		}
		Views: {
			asset_prices_weekly: {
				Row: {
					asset_id: number | null
					close: number | null
					high: number | null
					low: number | null
					open: number | null
					tstamp: string | null
					volume: number | null
				}
				Insert: {
					asset_id?: number | null
					close?: number | null
					high?: number | null
					low?: number | null
					open?: number | null
					tstamp?: string | null
					volume?: number | null
				}
				Update: {
					asset_id?: number | null
					close?: number | null
					high?: number | null
					low?: number | null
					open?: number | null
					tstamp?: string | null
					volume?: number | null
				}
				Relationships: [
					{
						foreignKeyName: "assetprices_asset_id_fkey"
						columns: ["asset_id"]
						isOneToOne: false
						referencedRelation: "assets"
						referencedColumns: ["id"]
					},
				]
			}
		}
		Functions: {
			daily_price_as_of: { Args: { p_day: string }; Returns: string }
			rebuild_latest_prices: { Args: never; Returns: undefined }
			rollup_intraday: { Args: { p_from: string }; Returns: number }
			search_assets: {
				Args: {
					asset_type_filter?: string
					result_limit?: number
					search_query: string
				}
				Returns: {
					asset_type: string
					description: string
					id: number
					last_updated: string
					name: string
					relevance_score: number
					symbol: string
				}[]
			}
		}
		Enums: {
			[_ in never]: never
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
	auth: {
		Tables: {
			audit_log_entries: {
				Row: {
					created_at: string | null
					id: string
					instance_id: string | null
					ip_address: string
					payload: Json | null
				}
				Insert: {
					created_at?: string | null
					id: string
					instance_id?: string | null
					ip_address?: string
					payload?: Json | null
				}
				Update: {
					created_at?: string | null
					id?: string
					instance_id?: string | null
					ip_address?: string
					payload?: Json | null
				}
				Relationships: []
			}
			flow_state: {
				Row: {
					auth_code: string
					auth_code_issued_at: string | null
					authentication_method: string
					code_challenge: string
					code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
					created_at: string | null
					id: string
					provider_access_token: string | null
					provider_refresh_token: string | null
					provider_type: string
					updated_at: string | null
					user_id: string | null
				}
				Insert: {
					auth_code: string
					auth_code_issued_at?: string | null
					authentication_method: string
					code_challenge: string
					code_challenge_method: Database["auth"]["Enums"]["code_challenge_method"]
					created_at?: string | null
					id: string
					provider_access_token?: string | null
					provider_refresh_token?: string | null
					provider_type: string
					updated_at?: string | null
					user_id?: string | null
				}
				Update: {
					auth_code?: string
					auth_code_issued_at?: string | null
					authentication_method?: string
					code_challenge?: string
					code_challenge_method?: Database["auth"]["Enums"]["code_challenge_method"]
					created_at?: string | null
					id?: string
					provider_access_token?: string | null
					provider_refresh_token?: string | null
					provider_type?: string
					updated_at?: string | null
					user_id?: string | null
				}
				Relationships: []
			}
			identities: {
				Row: {
					created_at: string | null
					email: string | null
					id: string
					identity_data: Json
					last_sign_in_at: string | null
					provider: string
					provider_id: string
					updated_at: string | null
					user_id: string
				}
				Insert: {
					created_at?: string | null
					email?: string | null
					id?: string
					identity_data: Json
					last_sign_in_at?: string | null
					provider: string
					provider_id: string
					updated_at?: string | null
					user_id: string
				}
				Update: {
					created_at?: string | null
					email?: string | null
					id?: string
					identity_data?: Json
					last_sign_in_at?: string | null
					provider?: string
					provider_id?: string
					updated_at?: string | null
					user_id?: string
				}
				Relationships: [
					{
						foreignKeyName: "identities_user_id_fkey"
						columns: ["user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					},
				]
			}
			instances: {
				Row: {
					created_at: string | null
					id: string
					raw_base_config: string | null
					updated_at: string | null
					uuid: string | null
				}
				Insert: {
					created_at?: string | null
					id: string
					raw_base_config?: string | null
					updated_at?: string | null
					uuid?: string | null
				}
				Update: {
					created_at?: string | null
					id?: string
					raw_base_config?: string | null
					updated_at?: string | null
					uuid?: string | null
				}
				Relationships: []
			}
			mfa_amr_claims: {
				Row: {
					authentication_method: string
					created_at: string
					id: string
					session_id: string
					updated_at: string
				}
				Insert: {
					authentication_method: string
					created_at: string
					id: string
					session_id: string
					updated_at: string
				}
				Update: {
					authentication_method?: string
					created_at?: string
					id?: string
					session_id?: string
					updated_at?: string
				}
				Relationships: [
					{
						foreignKeyName: "mfa_amr_claims_session_id_fkey"
						columns: ["session_id"]
						isOneToOne: false
						referencedRelation: "sessions"
						referencedColumns: ["id"]
					},
				]
			}
			mfa_challenges: {
				Row: {
					created_at: string
					factor_id: string
					id: string
					ip_address: unknown
					otp_code: string | null
					verified_at: string | null
					web_authn_session_data: Json | null
				}
				Insert: {
					created_at: string
					factor_id: string
					id: string
					ip_address: unknown
					otp_code?: string | null
					verified_at?: string | null
					web_authn_session_data?: Json | null
				}
				Update: {
					created_at?: string
					factor_id?: string
					id?: string
					ip_address?: unknown
					otp_code?: string | null
					verified_at?: string | null
					web_authn_session_data?: Json | null
				}
				Relationships: [
					{
						foreignKeyName: "mfa_challenges_auth_factor_id_fkey"
						columns: ["factor_id"]
						isOneToOne: false
						referencedRelation: "mfa_factors"
						referencedColumns: ["id"]
					},
				]
			}
			mfa_factors: {
				Row: {
					created_at: string
					factor_type: Database["auth"]["Enums"]["factor_type"]
					friendly_name: string | null
					id: string
					last_challenged_at: string | null
					phone: string | null
					secret: string | null
					status: Database["auth"]["Enums"]["factor_status"]
					updated_at: string
					user_id: string
					web_authn_aaguid: string | null
					web_authn_credential: Json | null
				}
				Insert: {
					created_at: string
					factor_type: Database["auth"]["Enums"]["factor_type"]
					friendly_name?: string | null
					id: string
					last_challenged_at?: string | null
					phone?: string | null
					secret?: string | null
					status: Database["auth"]["Enums"]["factor_status"]
					updated_at: string
					user_id: string
					web_authn_aaguid?: string | null
					web_authn_credential?: Json | null
				}
				Update: {
					created_at?: string
					factor_type?: Database["auth"]["Enums"]["factor_type"]
					friendly_name?: string | null
					id?: string
					last_challenged_at?: string | null
					phone?: string | null
					secret?: string | null
					status?: Database["auth"]["Enums"]["factor_status"]
					updated_at?: string
					user_id?: string
					web_authn_aaguid?: string | null
					web_authn_credential?: Json | null
				}
				Relationships: [
					{
						foreignKeyName: "mfa_factors_user_id_fkey"
						columns: ["user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					},
				]
			}
			one_time_tokens: {
				Row: {
					created_at: string
					id: string
					relates_to: string
					token_hash: string
					token_type: Database["auth"]["Enums"]["one_time_token_type"]
					updated_at: string
					user_id: string
				}
				Insert: {
					created_at?: string
					id: string
					relates_to: string
					token_hash: string
					token_type: Database["auth"]["Enums"]["one_time_token_type"]
					updated_at?: string
					user_id: string
				}
				Update: {
					created_at?: string
					id?: string
					relates_to?: string
					token_hash?: string
					token_type?: Database["auth"]["Enums"]["one_time_token_type"]
					updated_at?: string
					user_id?: string
				}
				Relationships: [
					{
						foreignKeyName: "one_time_tokens_user_id_fkey"
						columns: ["user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					},
				]
			}
			refresh_tokens: {
				Row: {
					created_at: string | null
					id: number
					instance_id: string | null
					parent: string | null
					revoked: boolean | null
					session_id: string | null
					token: string | null
					updated_at: string | null
					user_id: string | null
				}
				Insert: {
					created_at?: string | null
					id?: number
					instance_id?: string | null
					parent?: string | null
					revoked?: boolean | null
					session_id?: string | null
					token?: string | null
					updated_at?: string | null
					user_id?: string | null
				}
				Update: {
					created_at?: string | null
					id?: number
					instance_id?: string | null
					parent?: string | null
					revoked?: boolean | null
					session_id?: string | null
					token?: string | null
					updated_at?: string | null
					user_id?: string | null
				}
				Relationships: [
					{
						foreignKeyName: "refresh_tokens_session_id_fkey"
						columns: ["session_id"]
						isOneToOne: false
						referencedRelation: "sessions"
						referencedColumns: ["id"]
					},
				]
			}
			saml_providers: {
				Row: {
					attribute_mapping: Json | null
					created_at: string | null
					entity_id: string
					id: string
					metadata_url: string | null
					metadata_xml: string
					name_id_format: string | null
					sso_provider_id: string
					updated_at: string | null
				}
				Insert: {
					attribute_mapping?: Json | null
					created_at?: string | null
					entity_id: string
					id: string
					metadata_url?: string | null
					metadata_xml: string
					name_id_format?: string | null
					sso_provider_id: string
					updated_at?: string | null
				}
				Update: {
					attribute_mapping?: Json | null
					created_at?: string | null
					entity_id?: string
					id?: string
					metadata_url?: string | null
					metadata_xml?: string
					name_id_format?: string | null
					sso_provider_id?: string
					updated_at?: string | null
				}
				Relationships: [
					{
						foreignKeyName: "saml_providers_sso_provider_id_fkey"
						columns: ["sso_provider_id"]
						isOneToOne: false
						referencedRelation: "sso_providers"
						referencedColumns: ["id"]
					},
				]
			}
			saml_relay_states: {
				Row: {
					created_at: string | null
					flow_state_id: string | null
					for_email: string | null
					id: string
					redirect_to: string | null
					request_id: string
					sso_provider_id: string
					updated_at: string | null
				}
				Insert: {
					created_at?: string | null
					flow_state_id?: string | null
					for_email?: string | null
					id: string
					redirect_to?: string | null
					request_id: string
					sso_provider_id: string
					updated_at?: string | null
				}
				Update: {
					created_at?: string | null
					flow_state_id?: string | null
					for_email?: string | null
					id?: string
					redirect_to?: string | null
					request_id?: string
					sso_provider_id?: string
					updated_at?: string | null
				}
				Relationships: [
					{
						foreignKeyName: "saml_relay_states_flow_state_id_fkey"
						columns: ["flow_state_id"]
						isOneToOne: false
						referencedRelation: "flow_state"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "saml_relay_states_sso_provider_id_fkey"
						columns: ["sso_provider_id"]
						isOneToOne: false
						referencedRelation: "sso_providers"
						referencedColumns: ["id"]
					},
				]
			}
			schema_migrations: {
				Row: {
					version: string
				}
				Insert: {
					version: string
				}
				Update: {
					version?: string
				}
				Relationships: []
			}
			sessions: {
				Row: {
					aal: Database["auth"]["Enums"]["aal_level"] | null
					created_at: string | null
					factor_id: string | null
					id: string
					ip: unknown
					not_after: string | null
					refreshed_at: string | null
					tag: string | null
					updated_at: string | null
					user_agent: string | null
					user_id: string
				}
				Insert: {
					aal?: Database["auth"]["Enums"]["aal_level"] | null
					created_at?: string | null
					factor_id?: string | null
					id: string
					ip?: unknown
					not_after?: string | null
					refreshed_at?: string | null
					tag?: string | null
					updated_at?: string | null
					user_agent?: string | null
					user_id: string
				}
				Update: {
					aal?: Database["auth"]["Enums"]["aal_level"] | null
					created_at?: string | null
					factor_id?: string | null
					id?: string
					ip?: unknown
					not_after?: string | null
					refreshed_at?: string | null
					tag?: string | null
					updated_at?: string | null
					user_agent?: string | null
					user_id?: string
				}
				Relationships: [
					{
						foreignKeyName: "sessions_user_id_fkey"
						columns: ["user_id"]
						isOneToOne: false
						referencedRelation: "users"
						referencedColumns: ["id"]
					},
				]
			}
			sso_domains: {
				Row: {
					created_at: string | null
					domain: string
					id: string
					sso_provider_id: string
					updated_at: string | null
				}
				Insert: {
					created_at?: string | null
					domain: string
					id: string
					sso_provider_id: string
					updated_at?: string | null
				}
				Update: {
					created_at?: string | null
					domain?: string
					id?: string
					sso_provider_id?: string
					updated_at?: string | null
				}
				Relationships: [
					{
						foreignKeyName: "sso_domains_sso_provider_id_fkey"
						columns: ["sso_provider_id"]
						isOneToOne: false
						referencedRelation: "sso_providers"
						referencedColumns: ["id"]
					},
				]
			}
			sso_providers: {
				Row: {
					created_at: string | null
					id: string
					resource_id: string | null
					updated_at: string | null
				}
				Insert: {
					created_at?: string | null
					id: string
					resource_id?: string | null
					updated_at?: string | null
				}
				Update: {
					created_at?: string | null
					id?: string
					resource_id?: string | null
					updated_at?: string | null
				}
				Relationships: []
			}
			users: {
				Row: {
					aud: string | null
					banned_until: string | null
					confirmation_sent_at: string | null
					confirmation_token: string | null
					confirmed_at: string | null
					created_at: string | null
					deleted_at: string | null
					email: string | null
					email_change: string | null
					email_change_confirm_status: number | null
					email_change_sent_at: string | null
					email_change_token_current: string | null
					email_change_token_new: string | null
					email_confirmed_at: string | null
					encrypted_password: string | null
					id: string
					instance_id: string | null
					invited_at: string | null
					is_anonymous: boolean
					is_sso_user: boolean
					is_super_admin: boolean | null
					last_sign_in_at: string | null
					phone: string | null
					phone_change: string | null
					phone_change_sent_at: string | null
					phone_change_token: string | null
					phone_confirmed_at: string | null
					raw_app_meta_data: Json | null
					raw_user_meta_data: Json | null
					reauthentication_sent_at: string | null
					reauthentication_token: string | null
					recovery_sent_at: string | null
					recovery_token: string | null
					role: string | null
					updated_at: string | null
				}
				Insert: {
					aud?: string | null
					banned_until?: string | null
					confirmation_sent_at?: string | null
					confirmation_token?: string | null
					confirmed_at?: string | null
					created_at?: string | null
					deleted_at?: string | null
					email?: string | null
					email_change?: string | null
					email_change_confirm_status?: number | null
					email_change_sent_at?: string | null
					email_change_token_current?: string | null
					email_change_token_new?: string | null
					email_confirmed_at?: string | null
					encrypted_password?: string | null
					id: string
					instance_id?: string | null
					invited_at?: string | null
					is_anonymous?: boolean
					is_sso_user?: boolean
					is_super_admin?: boolean | null
					last_sign_in_at?: string | null
					phone?: string | null
					phone_change?: string | null
					phone_change_sent_at?: string | null
					phone_change_token?: string | null
					phone_confirmed_at?: string | null
					raw_app_meta_data?: Json | null
					raw_user_meta_data?: Json | null
					reauthentication_sent_at?: string | null
					reauthentication_token?: string | null
					recovery_sent_at?: string | null
					recovery_token?: string | null
					role?: string | null
					updated_at?: string | null
				}
				Update: {
					aud?: string | null
					banned_until?: string | null
					confirmation_sent_at?: string | null
					confirmation_token?: string | null
					confirmed_at?: string | null
					created_at?: string | null
					deleted_at?: string | null
					email?: string | null
					email_change?: string | null
					email_change_confirm_status?: number | null
					email_change_sent_at?: string | null
					email_change_token_current?: string | null
					email_change_token_new?: string | null
					email_confirmed_at?: string | null
					encrypted_password?: string | null
					id?: string
					instance_id?: string | null
					invited_at?: string | null
					is_anonymous?: boolean
					is_sso_user?: boolean
					is_super_admin?: boolean | null
					last_sign_in_at?: string | null
					phone?: string | null
					phone_change?: string | null
					phone_change_sent_at?: string | null
					phone_change_token?: string | null
					phone_confirmed_at?: string | null
					raw_app_meta_data?: Json | null
					raw_user_meta_data?: Json | null
					reauthentication_sent_at?: string | null
					reauthentication_token?: string | null
					recovery_sent_at?: string | null
					recovery_token?: string | null
					role?: string | null
					updated_at?: string | null
				}
				Relationships: []
			}
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			email: { Args: never; Returns: string }
			jwt: { Args: never; Returns: Json }
			role: { Args: never; Returns: string }
			uid: { Args: never; Returns: string }
		}
		Enums: {
			aal_level: "aal1" | "aal2" | "aal3"
			code_challenge_method: "s256" | "plain"
			factor_status: "unverified" | "verified"
			factor_type: "totp" | "webauthn" | "phone"
			one_time_token_type:
				| "confirmation_token"
				| "reauthentication_token"
				| "recovery_token"
				| "email_change_token_new"
				| "email_change_token_current"
				| "phone_change_token"
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
	depots: {
		Tables: {
			daily_values: {
				Row: {
					assets: number
					cash: number
					depot_id: number
					profit_from_start: number
					tstamp: string
					value: number
				}
				Insert: {
					assets: number
					cash: number
					depot_id: number
					profit_from_start: number
					tstamp: string
					value: number
				}
				Update: {
					assets?: number
					cash?: number
					depot_id?: number
					profit_from_start?: number
					tstamp?: string
					value?: number
				}
				Relationships: [
					{
						foreignKeyName: "daily_values_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "aggregated_values"
						referencedColumns: ["depot_id"]
					},
					{
						foreignKeyName: "daily_values_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "current_values"
						referencedColumns: ["depot_id"]
					},
					{
						foreignKeyName: "daily_values_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "depots"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "daily_values_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "leaderboard"
						referencedColumns: ["id"]
					},
				]
			}
			depots: {
				Row: {
					cash: number
					cash_start: number
					created: string
					id: number
					users: string[]
				}
				Insert: {
					cash: number
					cash_start: number
					created: string
					id?: number
					users: string[]
				}
				Update: {
					cash?: number
					cash_start?: number
					created?: string
					id?: number
					users?: string[]
				}
				Relationships: []
			}
			holdings: {
				Row: {
					amount: number
					asset_id: number | null
					commission: number
					depot_id: number
					expenses: number
				}
				Insert: {
					amount?: number
					asset_id?: number | null
					commission?: number
					depot_id: number
					expenses?: number
				}
				Update: {
					amount?: number
					asset_id?: number | null
					commission?: number
					depot_id?: number
					expenses?: number
				}
				Relationships: [
					{
						foreignKeyName: "holdings_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "aggregated_values"
						referencedColumns: ["depot_id"]
					},
					{
						foreignKeyName: "holdings_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "current_values"
						referencedColumns: ["depot_id"]
					},
					{
						foreignKeyName: "holdings_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "depots"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "holdings_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "leaderboard"
						referencedColumns: ["id"]
					},
				]
			}
			savings_plans: {
				Row: {
					asset_id: number
					created: string
					created_by: string
					depot_id: number
					id: number
					last_changed: string
					last_executed: string | null
					period: Database["public"]["Enums"]["savingsperiod"]
					worth: number
				}
				Insert: {
					asset_id: number
					created: string
					created_by: string
					depot_id: number
					id?: number
					last_changed: string
					last_executed?: string | null
					period: Database["public"]["Enums"]["savingsperiod"]
					worth: number
				}
				Update: {
					asset_id?: number
					created?: string
					created_by?: string
					depot_id?: number
					id?: number
					last_changed?: string
					last_executed?: string | null
					period?: Database["public"]["Enums"]["savingsperiod"]
					worth?: number
				}
				Relationships: [
					{
						foreignKeyName: "savings_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "aggregated_values"
						referencedColumns: ["depot_id"]
					},
					{
						foreignKeyName: "savings_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "current_values"
						referencedColumns: ["depot_id"]
					},
					{
						foreignKeyName: "savings_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "depots"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "savings_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "leaderboard"
						referencedColumns: ["id"]
					},
				]
			}
			savings_plans_budget: {
				Row: {
					budget: number
					depot_id: number
					last_changed: string
				}
				Insert: {
					budget: number
					depot_id: number
					last_changed?: string
				}
				Update: {
					budget?: number
					depot_id?: number
					last_changed?: string
				}
				Relationships: [
					{
						foreignKeyName: "savings_plans_budget_depot_id_fkey"
						columns: ["depot_id"]
						isOneToOne: true
						referencedRelation: "aggregated_values"
						referencedColumns: ["depot_id"]
					},
					{
						foreignKeyName: "savings_plans_budget_depot_id_fkey"
						columns: ["depot_id"]
						isOneToOne: true
						referencedRelation: "current_values"
						referencedColumns: ["depot_id"]
					},
					{
						foreignKeyName: "savings_plans_budget_depot_id_fkey"
						columns: ["depot_id"]
						isOneToOne: true
						referencedRelation: "depots"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "savings_plans_budget_depot_id_fkey"
						columns: ["depot_id"]
						isOneToOne: true
						referencedRelation: "leaderboard"
						referencedColumns: ["id"]
					},
				]
			}
			transactions: {
				Row: {
					amount: number
					asset_id: number | null
					commission: number
					depot_id: number
					id: number
					price: number | null
					tstamp: string
					type: Database["depots"]["Enums"]["transactiontype"]
					user_id: string | null
				}
				Insert: {
					amount: number
					asset_id?: number | null
					commission?: number
					depot_id: number
					id?: number
					price?: number | null
					tstamp?: string
					type?: Database["depots"]["Enums"]["transactiontype"]
					user_id?: string | null
				}
				Update: {
					amount?: number
					asset_id?: number | null
					commission?: number
					depot_id?: number
					id?: number
					price?: number | null
					tstamp?: string
					type?: Database["depots"]["Enums"]["transactiontype"]
					user_id?: string | null
				}
				Relationships: [
					{
						foreignKeyName: "transactions_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "aggregated_values"
						referencedColumns: ["depot_id"]
					},
					{
						foreignKeyName: "transactions_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "current_values"
						referencedColumns: ["depot_id"]
					},
					{
						foreignKeyName: "transactions_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "depots"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "transactions_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "leaderboard"
						referencedColumns: ["id"]
					},
				]
			}
		}
		Views: {
			aggregated_values: {
				Row: {
					assets: number | null
					cash: number | null
					depot_id: number | null
					diff_1d: number | null
					diff_1m: number | null
					diff_1y: number | null
					prev_1d_total: number | null
					prev_1m_total: number | null
					prev_1y_total: number | null
					profit_from_start: number | null
					rel_diff_1d: number | null
					rel_diff_1m: number | null
					rel_diff_1y: number | null
					total: number | null
					tstamp: string | null
				}
				Relationships: []
			}
			current_values: {
				Row: {
					assets: number | null
					cash: number | null
					depot_id: number | null
					profit_from_start: number | null
					tstamp: string | null
					value: number | null
				}
				Relationships: []
			}
			depot_overview: {
				Row: {
					all_ids: string[] | null
					cash: number | null
					cash_start: number | null
					id: number | null
					monthly_budget: number | null
					position_count: number | null
					transaction_count: number | null
					user_ids: string[] | null
					user_names: string[] | null
				}
				Relationships: []
			}
			leaderboard: {
				Row: {
					assets: number | null
					cash: number | null
					cash_start: number | null
					created: string | null
					id: number | null
					prev_rank: number | null
					profit_from_start: number | null
					rank: number | null
					sparkline: number[] | null
					tstamp: string | null
					users: Database["users"]["CompositeTypes"]["profile_ref"][] | null
					value: number | null
				}
				Relationships: []
			}
			savings_plans_budget_overview: {
				Row: {
					budget: number | null
					depot_id: number | null
					last_changed: string | null
					monthly_expenses: number | null
					remaining_budget: number | null
				}
				Relationships: [
					{
						foreignKeyName: "savings_plans_budget_depot_id_fkey"
						columns: ["depot_id"]
						isOneToOne: true
						referencedRelation: "aggregated_values"
						referencedColumns: ["depot_id"]
					},
					{
						foreignKeyName: "savings_plans_budget_depot_id_fkey"
						columns: ["depot_id"]
						isOneToOne: true
						referencedRelation: "current_values"
						referencedColumns: ["depot_id"]
					},
					{
						foreignKeyName: "savings_plans_budget_depot_id_fkey"
						columns: ["depot_id"]
						isOneToOne: true
						referencedRelation: "depots"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "savings_plans_budget_depot_id_fkey"
						columns: ["depot_id"]
						isOneToOne: true
						referencedRelation: "leaderboard"
						referencedColumns: ["id"]
					},
				]
			}
			savings_plans_with_asset: {
				Row: {
					asset_id: number | null
					asset_type: Database["public"]["Enums"]["assettype"] | null
					created: string | null
					depot_id: number | null
					description: string | null
					frequency: Database["public"]["Enums"]["savingsperiod"] | null
					id: number | null
					last_changed: string | null
					last_executed: string | null
					last_updated: string | null
					name: string | null
					symbol: string | null
					worth: number | null
				}
				Relationships: [
					{
						foreignKeyName: "savings_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "aggregated_values"
						referencedColumns: ["depot_id"]
					},
					{
						foreignKeyName: "savings_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "current_values"
						referencedColumns: ["depot_id"]
					},
					{
						foreignKeyName: "savings_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "depots"
						referencedColumns: ["id"]
					},
					{
						foreignKeyName: "savings_depot_fkey"
						columns: ["depot_id"]
						isOneToOne: false
						referencedRelation: "leaderboard"
						referencedColumns: ["id"]
					},
				]
			}
			values: {
				Row: {
					assets: number | null
					cash: number | null
					depot_id: number | null
					profit_from_start: number | null
					tstamp: string | null
					value: number | null
				}
				Relationships: []
			}
		}
		Functions: {
			apply_ledger_delta: {
				Args: {
					p_rows: Database["depots"]["Tables"]["transactions"]["Row"][]
					p_sign: number
				}
				Returns: undefined
			}
			buy_asset: {
				Args: { p_asset_id: number; p_depot_id: number; p_worth: number }
				Returns: undefined
			}
			change_budget: {
				Args: { p_budget: number; p_depot_id: number }
				Returns: undefined
			}
			check_savings_budget: {
				Args: {
					p_depot_id: number
					p_exclude_id: number
					p_period: Database["public"]["Enums"]["savingsperiod"]
					p_worth: number
				}
				Returns: undefined
			}
			delete_savings_plan: { Args: { p_ids: number[] }; Returns: undefined }
			execute_savings_plans: { Args: never; Returns: number }
			get_commission: { Args: never; Returns: number }
			get_depot_overview: {
				Args: never
				Returns: {
					all_ids: string[]
					cash: number
					cash_start: number
					id: number
					monthly_budget: number
					position_count: number
					transaction_count: number
					user_ids: string[]
					user_names: string[]
				}[]
			}
			get_intraday_values: {
				Args: { p_depot_id: number; p_since?: string }
				Returns: {
					assets: number
					cash: number
					tstamp: string
					value: number
				}[]
			}
			get_position_profits: {
				Args: { p_depot_id: number }
				Returns: {
					asset_id: number
					asset_type: string
					current_amount: number
					current_price: number
					depot_id: number
					description: string
					market_value: number
					name: string
					symbol: string
					total_invested: number
					total_profit: number
					total_sold: number
				}[]
			}
			get_transactions_with_position: {
				Args: { p_depot_id: number }
				Returns: {
					amount: number
					asset_id: number
					asset_type: string
					commission: number
					current_amount: number
					current_price: number
					depot_id: number
					description: string
					id: number
					market_value: number
					price: number
					symbol: string
					total_invested: number
					total_profit: number
					total_sold: number
					tstamp: string
					type: string
					user_id: string
				}[]
			}
			grant_reward: {
				Args: { p_amount: number; p_depot_id: number }
				Returns: undefined
			}
			is_depot_member: { Args: { depot_id: number }; Returns: boolean }
			new_depot_for_user: { Args: { p_user_id: string }; Returns: number }
			rebuild_depot_values: {
				Args: { p_depot_id?: number; p_from?: string }
				Returns: undefined
			}
			rebuild_depot_values_for: {
				Args: { p_depot_ids: number[]; p_from_days: string[] }
				Returns: undefined
			}
			rebuild_holdings: { Args: never; Returns: undefined }
			sell_asset: {
				Args: { p_asset_id: number; p_depot_id: number; p_worth: number }
				Returns: undefined
			}
			sp_to_interval: {
				Args: { period: Database["public"]["Enums"]["savingsperiod"] }
				Returns: string
			}
			sp_to_per_month: {
				Args: { period: Database["public"]["Enums"]["savingsperiod"] }
				Returns: number
			}
			transaction_affects_commission: {
				Args: { t: Database["depots"]["Enums"]["transactiontype"] }
				Returns: boolean
			}
			transaction_expense: {
				Args: {
					amount: number
					price: number
					t: Database["depots"]["Enums"]["transactiontype"]
				}
				Returns: number
			}
			update_savings_plan: {
				Args: {
					p_asset_id: number
					p_frequency: Database["public"]["Enums"]["savingsperiod"]
					p_id: number
					p_worth: number
				}
				Returns: undefined
			}
			upsert_savings_plan: {
				Args: {
					p_asset_id: number
					p_depot_id: number
					p_frequency: Database["public"]["Enums"]["savingsperiod"]
					p_worth: number
				}
				Returns: undefined
			}
		}
		Enums: {
			transactiontype: "user" | "movement" | "savings_plan"
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
	public: {
		Tables: {
			[_ in never]: never
		}
		Views: {
			[_ in never]: never
		}
		Functions: {
			add_compression_policy: {
				Args: {
					compress_after?: unknown
					compress_created_before?: string
					hypertable: unknown
					if_not_exists?: boolean
					initial_start?: string
					schedule_interval?: string
					timezone?: string
				}
				Returns: number
			}
			add_continuous_aggregate_policy: {
				Args: {
					buckets_per_batch?: number
					continuous_aggregate: unknown
					end_offset: unknown
					if_not_exists?: boolean
					include_tiered_data?: boolean
					initial_start?: string
					max_batches_per_execution?: number
					refresh_newest_first?: boolean
					schedule_interval: string
					start_offset: unknown
					timezone?: string
				}
				Returns: number
			}
			add_dimension:
				| {
						Args: {
							chunk_time_interval?: unknown
							column_name: unknown
							hypertable: unknown
							if_not_exists?: boolean
							number_partitions?: number
							partitioning_func?: unknown
						}
						Returns: {
							column_name: unknown
							created: boolean
							dimension_id: number
							schema_name: unknown
							table_name: unknown
						}[]
				  }
				| {
						Args: {
							dimension: unknown
							hypertable: unknown
							if_not_exists?: boolean
						}
						Returns: {
							created: boolean
							dimension_id: number
						}[]
				  }
			add_job: {
				Args: {
					check_config?: unknown
					config?: Json
					fixed_schedule?: boolean
					initial_start?: string
					job_name?: string
					proc: unknown
					schedule_interval: string
					scheduled?: boolean
					timezone?: string
				}
				Returns: number
			}
			add_reorder_policy: {
				Args: {
					hypertable: unknown
					if_not_exists?: boolean
					index_name: unknown
					initial_start?: string
					timezone?: string
				}
				Returns: number
			}
			add_retention_policy: {
				Args: {
					drop_after?: unknown
					drop_created_before?: string
					if_not_exists?: boolean
					initial_start?: string
					relation: unknown
					schedule_interval?: string
					timezone?: string
				}
				Returns: number
			}
			alter_job: {
				Args: {
					check_config?: unknown
					config?: Json
					fixed_schedule?: boolean
					if_exists?: boolean
					initial_start?: string
					job_id: number
					job_name?: string
					max_retries?: number
					max_runtime?: string
					next_start?: string
					retry_period?: string
					schedule_interval?: string
					scheduled?: boolean
					timezone?: string
				}
				Returns: {
					application_name: unknown
					check_config: string
					config: Json
					fixed_schedule: boolean
					initial_start: string
					job_id: number
					max_retries: number
					max_runtime: string
					next_start: string
					retry_period: string
					schedule_interval: string
					scheduled: boolean
					timezone: string
				}[]
			}
			approximate_row_count: { Args: { relation: unknown }; Returns: number }
			attach_tablespace: {
				Args: {
					hypertable: unknown
					if_not_attached?: boolean
					tablespace: unknown
				}
				Returns: undefined
			}
			by_hash: {
				Args: {
					column_name: unknown
					number_partitions: number
					partition_func?: unknown
				}
				Returns: unknown
			}
			by_range: {
				Args: {
					column_name: unknown
					partition_func?: unknown
					partition_interval?: unknown
				}
				Returns: unknown
			}
			chunk_columnstore_stats: {
				Args: { hypertable: unknown }
				Returns: {
					after_compression_index_bytes: number
					after_compression_table_bytes: number
					after_compression_toast_bytes: number
					after_compression_total_bytes: number
					before_compression_index_bytes: number
					before_compression_table_bytes: number
					before_compression_toast_bytes: number
					before_compression_total_bytes: number
					chunk_name: unknown
					chunk_schema: unknown
					compression_status: string
					node_name: unknown
				}[]
			}
			chunk_compression_stats: {
				Args: { hypertable: unknown }
				Returns: {
					after_compression_index_bytes: number
					after_compression_table_bytes: number
					after_compression_toast_bytes: number
					after_compression_total_bytes: number
					before_compression_index_bytes: number
					before_compression_table_bytes: number
					before_compression_toast_bytes: number
					before_compression_total_bytes: number
					chunk_name: unknown
					chunk_schema: unknown
					compression_status: string
					node_name: unknown
				}[]
			}
			chunks_detailed_size: {
				Args: { hypertable: unknown }
				Returns: {
					chunk_name: unknown
					chunk_schema: unknown
					index_bytes: number
					node_name: unknown
					table_bytes: number
					toast_bytes: number
					total_bytes: number
				}[]
			}
			compress_chunk: {
				Args: {
					if_not_compressed?: boolean
					recompress?: boolean
					uncompressed_chunk: unknown
				}
				Returns: unknown
			}
			create_hypertable:
				| {
						Args: {
							create_default_indexes?: boolean
							dimension: unknown
							if_not_exists?: boolean
							migrate_data?: boolean
							relation: unknown
						}
						Returns: {
							created: boolean
							hypertable_id: number
						}[]
				  }
				| {
						Args: {
							associated_schema_name?: unknown
							associated_table_prefix?: unknown
							chunk_sizing_func?: unknown
							chunk_target_size?: string
							chunk_time_interval?: unknown
							create_default_indexes?: boolean
							if_not_exists?: boolean
							migrate_data?: boolean
							number_partitions?: number
							partitioning_column?: unknown
							partitioning_func?: unknown
							relation: unknown
							time_column_name: unknown
							time_partitioning_func?: unknown
						}
						Returns: {
							created: boolean
							hypertable_id: number
							schema_name: unknown
							table_name: unknown
						}[]
				  }
			decompress_chunk: {
				Args: { if_compressed?: boolean; uncompressed_chunk: unknown }
				Returns: unknown
			}
			delete_job: { Args: { job_id: number }; Returns: undefined }
			detach_tablespace: {
				Args: {
					hypertable?: unknown
					if_attached?: boolean
					tablespace: unknown
				}
				Returns: number
			}
			detach_tablespaces: { Args: { hypertable: unknown }; Returns: number }
			disable_chunk_skipping: {
				Args: {
					column_name: unknown
					hypertable: unknown
					if_not_exists?: boolean
				}
				Returns: {
					column_name: unknown
					disabled: boolean
					hypertable_id: number
				}[]
			}
			drop_chunks: {
				Args: {
					created_after?: unknown
					created_before?: unknown
					newer_than?: unknown
					older_than?: unknown
					relation: unknown
					verbose?: boolean
				}
				Returns: string[]
			}
			enable_chunk_skipping: {
				Args: {
					column_name: unknown
					hypertable: unknown
					if_not_exists?: boolean
				}
				Returns: {
					column_stats_id: number
					enabled: boolean
				}[]
			}
			generate_uuidv7: { Args: never; Returns: string }
			get_telemetry_report: { Args: never; Returns: Json }
			hypertable_approximate_detailed_size: {
				Args: { relation: unknown }
				Returns: {
					index_bytes: number
					table_bytes: number
					toast_bytes: number
					total_bytes: number
				}[]
			}
			hypertable_approximate_size: {
				Args: { hypertable: unknown }
				Returns: number
			}
			hypertable_columnstore_stats: {
				Args: { hypertable: unknown }
				Returns: {
					after_compression_index_bytes: number
					after_compression_table_bytes: number
					after_compression_toast_bytes: number
					after_compression_total_bytes: number
					before_compression_index_bytes: number
					before_compression_table_bytes: number
					before_compression_toast_bytes: number
					before_compression_total_bytes: number
					node_name: unknown
					number_compressed_chunks: number
					total_chunks: number
				}[]
			}
			hypertable_compression_stats: {
				Args: { hypertable: unknown }
				Returns: {
					after_compression_index_bytes: number
					after_compression_table_bytes: number
					after_compression_toast_bytes: number
					after_compression_total_bytes: number
					before_compression_index_bytes: number
					before_compression_table_bytes: number
					before_compression_toast_bytes: number
					before_compression_total_bytes: number
					node_name: unknown
					number_compressed_chunks: number
					total_chunks: number
				}[]
			}
			hypertable_detailed_size: {
				Args: { hypertable: unknown }
				Returns: {
					index_bytes: number
					node_name: unknown
					table_bytes: number
					toast_bytes: number
					total_bytes: number
				}[]
			}
			hypertable_index_size: { Args: { index_name: unknown }; Returns: number }
			hypertable_size: { Args: { hypertable: unknown }; Returns: number }
			interpolate:
				| {
						Args: {
							next?: Record<string, unknown>
							prev?: Record<string, unknown>
							value: number
						}
						Returns: number
				  }
				| {
						Args: {
							next?: Record<string, unknown>
							prev?: Record<string, unknown>
							value: number
						}
						Returns: number
				  }
				| {
						Args: {
							next?: Record<string, unknown>
							prev?: Record<string, unknown>
							value: number
						}
						Returns: number
				  }
				| {
						Args: {
							next?: Record<string, unknown>
							prev?: Record<string, unknown>
							value: number
						}
						Returns: number
				  }
				| {
						Args: {
							next?: Record<string, unknown>
							prev?: Record<string, unknown>
							value: number
						}
						Returns: number
				  }
			locf: {
				Args: {
					prev?: unknown
					treat_null_as_missing?: boolean
					value: unknown
				}
				Returns: unknown
			}
			move_chunk: {
				Args: {
					chunk: unknown
					destination_tablespace: unknown
					index_destination_tablespace?: unknown
					reorder_index?: unknown
					verbose?: boolean
				}
				Returns: undefined
			}
			remove_compression_policy: {
				Args: { hypertable: unknown; if_exists?: boolean }
				Returns: boolean
			}
			remove_continuous_aggregate_policy: {
				Args: {
					continuous_aggregate: unknown
					if_exists?: boolean
					if_not_exists?: boolean
				}
				Returns: undefined
			}
			remove_reorder_policy: {
				Args: { hypertable: unknown; if_exists?: boolean }
				Returns: undefined
			}
			remove_retention_policy: {
				Args: { if_exists?: boolean; relation: unknown }
				Returns: undefined
			}
			reorder_chunk: {
				Args: { chunk: unknown; index?: unknown; verbose?: boolean }
				Returns: undefined
			}
			set_adaptive_chunking: {
				Args: {
					chunk_sizing_func?: unknown
					chunk_target_size: string
					hypertable: unknown
				}
				Returns: Record<string, unknown>
			}
			set_chunk_time_interval: {
				Args: {
					chunk_time_interval: unknown
					dimension_name?: unknown
					hypertable: unknown
				}
				Returns: undefined
			}
			set_integer_now_func: {
				Args: {
					hypertable: unknown
					integer_now_func: unknown
					replace_if_exists?: boolean
				}
				Returns: undefined
			}
			set_number_partitions: {
				Args: {
					dimension_name?: unknown
					hypertable: unknown
					number_partitions: number
				}
				Returns: undefined
			}
			set_partitioning_interval: {
				Args: {
					dimension_name?: unknown
					hypertable: unknown
					partition_interval: unknown
				}
				Returns: undefined
			}
			show_chunks: {
				Args: {
					created_after?: unknown
					created_before?: unknown
					newer_than?: unknown
					older_than?: unknown
					relation: unknown
				}
				Returns: unknown[]
			}
			show_limit: { Args: never; Returns: number }
			show_tablespaces: { Args: { hypertable: unknown }; Returns: unknown[] }
			show_trgm: { Args: { "": string }; Returns: string[] }
			time_bucket:
				| { Args: { bucket_width: number; ts: number }; Returns: number }
				| {
						Args: { bucket_width: number; offset: number; ts: number }
						Returns: number
				  }
				| { Args: { bucket_width: number; ts: number }; Returns: number }
				| {
						Args: { bucket_width: number; offset: number; ts: number }
						Returns: number
				  }
				| { Args: { bucket_width: string; ts: string }; Returns: string }
				| {
						Args: { bucket_width: string; offset: string; ts: string }
						Returns: string
				  }
				| {
						Args: { bucket_width: string; origin: string; ts: string }
						Returns: string
				  }
				| { Args: { bucket_width: string; ts: string }; Returns: string }
				| {
						Args: { bucket_width: string; offset: string; ts: string }
						Returns: string
				  }
				| {
						Args: { bucket_width: string; origin: string; ts: string }
						Returns: string
				  }
				| {
						Args: {
							bucket_width: string
							offset?: string
							origin?: string
							timezone: string
							ts: string
						}
						Returns: string
				  }
				| { Args: { bucket_width: string; ts: string }; Returns: string }
				| {
						Args: { bucket_width: string; offset: string; ts: string }
						Returns: string
				  }
				| {
						Args: { bucket_width: string; origin: string; ts: string }
						Returns: string
				  }
				| { Args: { bucket_width: string; ts: string }; Returns: string }
				| {
						Args: { bucket_width: string; offset: string; ts: string }
						Returns: string
				  }
				| {
						Args: { bucket_width: string; origin: string; ts: string }
						Returns: string
				  }
				| {
						Args: {
							bucket_width: string
							offset?: string
							origin?: string
							timezone: string
							ts: string
						}
						Returns: string
				  }
				| { Args: { bucket_width: number; ts: number }; Returns: number }
				| {
						Args: { bucket_width: number; offset: number; ts: number }
						Returns: number
				  }
			time_bucket_gapfill:
				| {
						Args: {
							bucket_width: number
							finish?: number
							start?: number
							ts: number
						}
						Returns: number
				  }
				| {
						Args: {
							bucket_width: number
							finish?: number
							start?: number
							ts: number
						}
						Returns: number
				  }
				| {
						Args: {
							bucket_width: string
							finish?: string
							start?: string
							ts: string
						}
						Returns: string
				  }
				| {
						Args: {
							bucket_width: string
							finish?: string
							start?: string
							ts: string
						}
						Returns: string
				  }
				| {
						Args: {
							bucket_width: string
							finish?: string
							start?: string
							timezone: string
							ts: string
						}
						Returns: string
				  }
				| {
						Args: {
							bucket_width: string
							finish?: string
							start?: string
							ts: string
						}
						Returns: string
				  }
				| {
						Args: {
							bucket_width: number
							finish?: number
							start?: number
							ts: number
						}
						Returns: number
				  }
			timescaledb_post_restore: { Args: never; Returns: boolean }
			timescaledb_pre_restore: { Args: never; Returns: boolean }
			to_uuidv7: { Args: { ts: string }; Returns: string }
			to_uuidv7_boundary: { Args: { ts: string }; Returns: string }
			uuid_timestamp: { Args: { uuid: string }; Returns: string }
			uuid_timestamp_micros: { Args: { uuid: string }; Returns: string }
			uuid_version: { Args: { uuid: string }; Returns: number }
		}
		Enums: {
			assettype: "commodity" | "crypto" | "fund" | "stock"
			priceprovider: "alpaca" | "yahoo"
			savingsperiod: "annually" | "monthly" | "weekly" | "daily"
		}
		CompositeTypes: {
			[_ in never]: never
		}
	}
	users: {
		Tables: {
			special_roles: {
				Row: {
					granted_at: string
					user_id: string
					user_role: Database["users"]["Enums"]["special_role"]
				}
				Insert: {
					granted_at?: string
					user_id: string
					user_role: Database["users"]["Enums"]["special_role"]
				}
				Update: {
					granted_at?: string
					user_id?: string
					user_role?: Database["users"]["Enums"]["special_role"]
				}
				Relationships: []
			}
		}
		Views: {
			admin_overview: {
				Row: {
					banned_until: string | null
					created_at: string | null
					depot_count: number | null
					email: string | null
					id: string | null
					meta_data: Json | null
					position_count: number | null
					role_granted_at: string[] | null
					transaction_count: number | null
					user_name: string | null
					user_roles: Database["users"]["Enums"]["special_role"][] | null
				}
				Relationships: []
			}
			profile: {
				Row: {
					created_at: string | null
					name: string | null
					user_id: string | null
				}
				Relationships: []
			}
		}
		Functions: {
			get_admin_overview: {
				Args: never
				Returns: {
					banned_until: string
					created_at: string
					depot_count: number
					email: string
					id: string
					meta_data: Json
					position_count: number
					role_granted_at: string[]
					transaction_count: number
					user_name: string
					user_roles: Database["users"]["Enums"]["special_role"][]
				}[]
			}
			get_all_profiles: {
				Args: never
				Returns: {
					created_at: string
					name: string
					user_id: string
				}[]
			}
			grant_role: {
				Args: {
					p_user_id: string
					p_user_role: Database["users"]["Enums"]["special_role"]
				}
				Returns: undefined
			}
			grant_teacher: { Args: { p_user_id: string }; Returns: undefined }
			has_any_role: {
				Args: { required_roles: Database["users"]["Enums"]["special_role"][] }
				Returns: boolean
			}
			has_role: {
				Args: { required_role: Database["users"]["Enums"]["special_role"] }
				Returns: boolean
			}
			is_superuser_session: { Args: never; Returns: boolean }
			revoke_role: {
				Args: {
					p_user_id: string
					p_user_role: Database["users"]["Enums"]["special_role"]
				}
				Returns: undefined
			}
			revoke_teacher: { Args: { p_user_id: string }; Returns: undefined }
			stats: {
				Args: never
				Returns: {
					admin_count: number
					student_count: number
					teacher_count: number
					user_count: number
				}[]
			}
		}
		Enums: {
			special_role: "admin" | "teacher"
		}
		CompositeTypes: {
			profile_ref: {
				user_id: string | null
				name: string | null
			}
		}
	}
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R
			}
			? R
			: never
		: never

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I
			}
			? I
			: never
		: never

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U
			}
			? U
			: never
		: never

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never

export const Constants = {
	api: {
		Enums: {},
	},
	auth: {
		Enums: {
			aal_level: ["aal1", "aal2", "aal3"],
			code_challenge_method: ["s256", "plain"],
			factor_status: ["unverified", "verified"],
			factor_type: ["totp", "webauthn", "phone"],
			one_time_token_type: [
				"confirmation_token",
				"reauthentication_token",
				"recovery_token",
				"email_change_token_new",
				"email_change_token_current",
				"phone_change_token",
			],
		},
	},
	depots: {
		Enums: {
			transactiontype: ["user", "movement", "savings_plan"],
		},
	},
	public: {
		Enums: {
			assettype: ["commodity", "crypto", "fund", "stock"],
			priceprovider: ["alpaca", "yahoo"],
			savingsperiod: ["annually", "monthly", "weekly", "daily"],
		},
	},
	users: {
		Enums: {
			special_role: ["admin", "teacher"],
		},
	},
} as const
