from datetime import date, datetime


# ---------- FORMAT HELPERS ----------

def fmt_date(val):
    if isinstance(val, (date, datetime)):
        return val.strftime("%m/%d/%Y")
    return ""


def money(val):
    if val is None:
        return "NA"
    return f"${float(val):.2f}"


def safe(val, default=""):
    return default if val is None else val


def routing(val):
    if val is None:
        return "NA"
    return f"'{str(val)}"  # FORCE TEXT, preserve leading zero


# ---------- MAIN ROW BUILDER ----------

def build_order_row(data) -> list:
    """
    Builds a Google Sheets row EXACTLY matching existing sheet format.
    Accepts Pydantic model or dict.
    """

    if hasattr(data, "dict"):
        data = data.dict()

    client = data["client"]
    billing = data["billing_terms"]
    contacts = data["contacts"]
    plans = data["plan_catalog"]
    addons = data.get("add_on_modules", [])
    bank = data.get("bank_account", {})

    dsp_contact = next(
        (c for c in contacts if c["contact_type"] == "DSP"),
        {}
    )

    # ---------- PLAN HELPERS ----------

    def get_plan(label):
        return next(
            (p for p in plans if p["employee_range_label"] == label),
            None
        )

    def plan_block(plan):
        if not plan:
            return ["NA", "NA", "NA"]

        weekly = (
            f"Base Fee: {money(plan['weekly_base_fee'])}, "
            f"per check: {money(plan['weekly_per_check'])}"
            if plan.get("weekly_base_fee") is not None
            or plan.get("weekly_per_check") is not None
            else "NA"
        )

        biweekly = (
            f"Base Fee: {money(plan['biweekly_base_fee'])}, "
            f"per check: {money(plan['biweekly_per_check'])}"
            if plan.get("biweekly_base_fee") is not None
            or plan.get("biweekly_per_check") is not None
            else "NA"
        )

        one_time = money(plan.get("one_time_implementation_fee"))

        return [weekly, biweekly, one_time]

    # ---------- ADD-ON HELPERS ----------

    addon_map = {a["module_name"]: a for a in addons}

    def addon_block(name):
        addon = addon_map.get(name)
        if not addon:
            return ["NA", 0, 0]

        fee = f"{money(addon['fee_per_unit'])}/{addon['unit_type']}"
        units = addon["units"]
        total = f"{money(addon['subscription_fee'])} /year"

        return [fee, units, total]

    # ---------- BUILD ROW ----------

    return [
        # Dates
        fmt_date(billing["initial_term_start_date"]),
        fmt_date(billing["initial_term_end_date"]),
        fmt_date(billing["initial_term_start_date"]),

        # Client
        client["dsp_fein"],
        dsp_contact.get("email", ""),
        client["dsp_name"],
        client["dsp_name"],

        # Status
        "Active",
        "",
        "",
        "Yes",
        "",

        # Plans
        *plan_block(get_plan("01-50")),
        *plan_block(get_plan("51-100")),
        *plan_block(get_plan("100+")),

        # Add-ons
        *addon_block("Benefits Admin"),
        *addon_block("ACA Reporting"),
        *addon_block("401(k)"),
        *addon_block("Garnishments"),

        # Contract
        billing["initial_term_period"].title(),
        f"Automatic for {billing['renewal_term_period']}",
        "",

        # Bank
        bank.get("bank_name", "NA"),
        bank.get("account_type", "NA"),
        routing(bank.get("routing_number")),
        bank.get("account_number", "NA"),
        "",

        # Card
        "", "", "", "", "", "",

        # Notes
        safe(data.get("additional_notes")),
    ]
