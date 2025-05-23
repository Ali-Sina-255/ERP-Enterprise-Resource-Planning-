from profile import Profile

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from pyexpat import model

from django.db.models import CharField, EmailField


class UserManager(BaseUserManager):
    def create_user(self, first_name, last_name, email, password=None):
        if not email:
            raise ValueError("User must have an email address!")

        user = self.model(
            email=self.normalize_email(email),
            first_name=first_name,
            last_name=last_name,
        )
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, first_name, last_name, email, password=None):
        # Create a user and set necessary flags for superuser
        user = self.create_user(
            first_name=first_name,
            last_name=last_name,
            email=self.normalize_email(email),
            password=password,
        )
        user.is_admin = True
        user.is_active = True
        user.is_staff = True
        user.is_superadmin = True
        # Assign the Admin role 0) to the superuser
        #user.role = User.Admin

        user.save(using=self._db)
        return user

class Role(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self) -> CharField:
        return self.name

    class Meta:
        verbose_name_plural = "Roles"
        ordering = ['name']

class User(AbstractBaseUser):

    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    phone_number = models.CharField(max_length=13, blank=True, null=True)
    is_free = models.BooleanField(default=False, blank=True, null=True)
    otp = models.CharField(max_length=8, blank=True, null=True)
    refresh_token = models.CharField(max_length=1000, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    is_superadmin = models.BooleanField(default=False)

    # The field used for user login
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = UserManager()

    def __str__(self) -> EmailField:
        return self.email

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return True


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, blank=True, null=True)
    profile_pic = models.ImageField(
        upload_to="user/profile_picture",
        blank=True,
        null=True,
    )
    address = models.CharField(max_length=200, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:

        if self.user:
            return f"{self.user.email}"
        else:
            return "No user associated"
