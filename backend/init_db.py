from app import app, db, User, PlayerProgress, PlayerInventory, bcrypt

def init_database():
    with app.app_context():
        # Drop all tables and recreate them
        db.drop_all()
        db.create_all()
        
        # Check if admin user exists
        admin_user = User.query.filter_by(username='admin').first()
        
        if not admin_user:
            # Create admin user
            admin_password_hash = bcrypt.generate_password_hash('admin123').decode('utf-8')
            admin_user = User(
                username='admin',
                email='admin@mindcraft.com',
                password_hash=admin_password_hash
            )
            db.session.add(admin_user)
            db.session.commit()
            
            # Create admin progress
            admin_progress = PlayerProgress(
                user_id=admin_user.id,
                level=1,
                xp=0,
                coins=100,
                current_stage=1,
                unlocked_areas='[1]'
            )
            db.session.add(admin_progress)
            
            # Create admin inventory
            admin_inventory = PlayerInventory(
                user_id=admin_user.id,
                items='{"wood": 10, "stone": 5, "diamond": 1}',
                home_decorations='[{"emoji": "🏆", "name": "Trophy"}, {"emoji": "⭐", "name": "Star"}, {"emoji": "🎨", "name": "Painting"}]',
                character_cards='{}',
                unlocked_characters='[]'
            )
            db.session.add(admin_inventory)
            
            db.session.commit()
            
            print("Database initialized successfully!")
            print("Admin user created:")
            print("Username: admin")
            print("Password: admin123")
        else:
            print("Database already initialized. Admin user exists.")

if __name__ == '__main__':
    init_database()
