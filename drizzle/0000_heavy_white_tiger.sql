CREATE TABLE "bills" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"date_start" text,
	"date_end" text,
	"month" text,
	"rent_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"water_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"old_pending_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"electricity_prev_unit" integer DEFAULT 0 NOT NULL,
	"electricity_curr_unit" integer DEFAULT 0 NOT NULL,
	"electricity_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"custom_charges" jsonb DEFAULT '[]'::jsonb,
	"total_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"rent_paid" numeric(10, 2) DEFAULT '0' NOT NULL,
	"water_paid" numeric(10, 2) DEFAULT '0' NOT NULL,
	"electricity_paid" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total_paid" numeric(10, 2) DEFAULT '0' NOT NULL,
	"is_paid" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"bill_id" integer,
	"amount" numeric(10, 2) NOT NULL,
	"payment_date" timestamp DEFAULT now(),
	"description" text
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"tenant_user_id" text,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"family_size" integer NOT NULL,
	"base_rent" numeric(10, 2) DEFAULT '0' NOT NULL,
	"water_charge" numeric(10, 2) DEFAULT '0' NOT NULL,
	"custom_charges" jsonb DEFAULT '[]'::jsonb,
	"is_landlord_confirmed" boolean DEFAULT true,
	"is_tenant_confirmed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE no action ON UPDATE no action;