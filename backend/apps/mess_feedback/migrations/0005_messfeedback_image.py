from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mess_feedback', '0004_messfeedback_meal_subtype_custom'),
    ]

    operations = [
        migrations.AddField(
            model_name='messfeedback',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='mess_feedback/'),
        ),
    ]
