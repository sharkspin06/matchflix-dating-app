import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import cloudinary from '../config/cloudinary.config';

const prisma = new PrismaClient();

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      age,
      gender,
      bio,
      location,
      latitude,
      longitude,
      zodiac,
      education,
      pets,
      drinkingHabits,
      smokingHabits,
      interests,
      topFilms,
      relationshipGoals,
      preferredGender,
      preferredAgeMin,
      preferredAgeMax,
      preferredDistance,
    } = req.body;

    console.log('=== UPDATE PROFILE REQUEST ===');
    console.log('Received topFilms:', topFilms);
    console.log('Received interests:', interests);
    console.log('Received zodiac:', zodiac);
    console.log('Received education:', education);
    console.log('Full request body:', req.body);

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = parseInt(age);
    if (gender !== undefined) updateData.gender = gender;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude);
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude);
    if (zodiac !== undefined) updateData.zodiac = zodiac;
    if (education !== undefined) updateData.education = education;
    if (pets !== undefined) updateData.pets = pets;
    if (drinkingHabits !== undefined) updateData.drinkingHabits = drinkingHabits;
    if (smokingHabits !== undefined) updateData.smokingHabits = smokingHabits;
    if (interests !== undefined) updateData.interests = interests;
    if (topFilms !== undefined) updateData.topFilms = topFilms;
    if (relationshipGoals !== undefined) updateData.relationshipGoals = relationshipGoals;
    if (preferredGender !== undefined) updateData.preferredGender = preferredGender;
    if (preferredAgeMin !== undefined) updateData.preferredAgeMin = parseInt(preferredAgeMin);
    if (preferredAgeMax !== undefined) updateData.preferredAgeMax = parseInt(preferredAgeMax);
    if (preferredDistance !== undefined) updateData.preferredDistance = parseInt(preferredDistance);

    console.log('Update data being sent to DB:', updateData);

    const profile = await prisma.profile.update({
      where: { userId: req.userId },
      data: updateData,
    });

    console.log('Profile updated successfully:', profile);
    console.log('Saved topFilms:', profile.topFilms);

    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const uploadPhoto = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Cloudinary automatically uploads the file and provides the URL
    const photoUrl = (req.file as any).path; // Cloudinary URL

    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Delete old profile picture from Cloudinary if it exists
    if (profile.photos.length > 0 && profile.photos[0].includes('cloudinary.com')) {
      try {
        const oldPhotoUrl = profile.photos[0];
        const urlParts = oldPhotoUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `matchflix/profiles/${publicIdWithExtension.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted old profile picture from Cloudinary: ${publicId}`);
      } catch (cloudinaryError) {
        console.error('Failed to delete old photo from Cloudinary:', cloudinaryError);
        // Continue even if deletion fails
      }
    }

    // Replace the first photo (profile picture) or add if no photos exist
    const updatedPhotos = profile.photos.length > 0 
      ? [photoUrl, ...profile.photos.slice(1)]  // Replace first photo, keep the rest
      : [photoUrl];  // Add first photo if none exist

    const updatedProfile = await prisma.profile.update({
      where: { userId: req.userId },
      data: {
        photos: updatedPhotos,
      },
    });

    res.json({ photoUrl, photos: updatedProfile.photos });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
};

export const deletePhoto = async (req: AuthRequest, res: Response) => {
  try {
    const { photoUrl } = req.body;

    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    if (photoUrl.includes('cloudinary.com')) {
      try {
        const urlParts = photoUrl.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `matchflix/profiles/${publicIdWithExtension.split('.')[0]}`;
        
        // Delete from Cloudinary
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
        // Continue even if Cloudinary deletion fails
      }
    }

    // Remove from database
    const updatedPhotos = profile.photos.filter((photo) => photo !== photoUrl);

    const updatedProfile = await prisma.profile.update({
      where: { userId: req.userId },
      data: {
        photos: updatedPhotos,
      },
    });

    res.json({ photos: updatedProfile.photos });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
};
