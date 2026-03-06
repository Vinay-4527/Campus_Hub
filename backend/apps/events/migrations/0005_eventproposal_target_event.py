import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0004_alter_event_description_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='eventproposal',
            name='target_event',
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='edit_proposals',
                to='events.event',
            ),
        ),
    ]
