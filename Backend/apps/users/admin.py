from operator import concat
from django.contrib import admin

from .models import  User, UserProfile



admin.site.register(UserProfile)


from django.contrib import admin

from .models import User  # Assuming you have the User model in the same app


class UserAdmin(admin.ModelAdmin):
    # Fields to display in the list view
    list_display = (
        "email", "first_name", "last_name", "is_active", "is_staff", "is_free"
    )

    # Fields that can be searched
    search_fields = ("email", "first_name", "last_name")

    # Fields to filter the user list
    list_filter = ("is_active", "is_staff", "is_free")

    # Fields that are editable in the list view
    list_editable = ("is_active", "is_staff")

    # Fields to display in the detail view (form to create/edit a user)
    fieldsets = (
        (None, {
            "fields": ("email", "password")
        }),
        ("Personal Info", {
            "fields": ("first_name", "last_name", "phone_number")
        }),
        ("Permissions", {
            "fields": ("is_active", "is_staff", "is_superadmin", "role", "is_free")
        }),
        ("Important Dates", {
            "fields": ("created_at", "updated_at")
        }),
    )

    # Making fields read-only (for sensitive data like password)
    readonly_fields = ("created_at", "updated_at")

    # Customizing the add/change form fields for User creation/edit
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password", "first_name", "last_name", "role", "phone_number")
        }),
    )


    # Enabling users to change password in the admin interface
    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.set_password(form.cleaned_data["password"])  # Set password only if it's new
        obj.save()

# Register the User model and the customized admin
admin.site.register(User, UserAdmin)
