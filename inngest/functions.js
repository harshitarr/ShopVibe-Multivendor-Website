import { inngest } from './client'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import Coupon from '@/lib/models/Coupon'

// Inngest Function to save user data to database
export const syncUserCreation = inngest.createFunction(
  { id: 'sync-user-create' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    await dbConnect(); // Connect to MongoDB
    
    const { data } = event;
    await User.create({
      _id: data.id, // Mongoose uses _id for custom IDs
      id: data.id,
      email: data.email_addresses[0].email_address,
      name: `${data.first_name} ${data.last_name}`,
      image: data.image_url,
      cart: {} // Default empty cart
    });
  }
)

// Inngest Function to update user data in database
export const syncUserUpdation = inngest.createFunction(
  { id: 'sync-user-update' },
  { event: 'clerk/user.updated' },
  async ({ event }) => {
    await dbConnect(); // Connect to MongoDB
    
    const { data } = event;
    await User.findByIdAndUpdate(
      data.id,
      {
        email: data.email_addresses[0].email_address,
        name: `${data.first_name} ${data.last_name}`,
        image: data.image_url,
      },
      { new: true } // Returns updated document
    );
  }
)

// Inngest Function to delete user from database
export const syncUserDeletion = inngest.createFunction(
  { id: 'sync-user-delete' },
  { event: 'clerk/user.deleted' },
  async ({ event }) => {
    await dbConnect(); // Connect to MongoDB
    
    const { data } = event;
    await User.findByIdAndDelete(data.id);
  }
)

// Inngest Function to delete coupon on expiry
export const deleteCouponOnExpiry = inngest.createFunction(
  { id: 'delete-coupon-on-expiry' },
  { event: 'app/coupon.expired' },
  async ({ event, step }) => {
    const { data } = event
    const expiryDate = new Date(data.expires_at)
    await step.sleepUntil('wait-for-expiry', expiryDate)

    await step.run('delete-coupon-from-database', async () => {
      await dbConnect(); // Connect to MongoDB
      await Coupon.findOneAndDelete({
        code: data.code
      })
    })
  }
)
