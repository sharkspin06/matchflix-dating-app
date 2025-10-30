import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Sample profiles data with profile photos
  const profiles = [
    {
      email: 'sarah@example.com',
      name: 'Sarah',
      age: 24,
      gender: 'female',
      bio: "Let's skip the endless calling and just meet. Film enthusiast who loves indie movies and classic cinema.",
      location: 'Madrid, Spain',
      photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=1200&fit=crop'],
      interests: ['Drama', 'Romance', 'Thriller', 'Sci-Fi', 'Comedy'],
      preferredGender: ['male', 'female'],
      preferredAgeMin: 22,
      preferredAgeMax: 30,
    },
    {
      email: 'emma@example.com',
      name: 'Emma',
      age: 26,
      gender: 'female',
      bio: 'Passionate about storytelling through film. Love exploring new genres and directors.',
      location: 'Manila, Philippines',
      interests: ['Action', 'Drama', 'Documentary', 'Horror'],
      preferredGender: ['male'],
      preferredAgeMin: 24,
      preferredAgeMax: 32,
    },
    {
      email: 'khalil@example.com',
      name: 'Khalil',
      age: 28,
      gender: 'male',
      bio: 'Cinema lover and aspiring filmmaker. Always up for deep conversations about movies.',
      location: 'Quezon City, Philippines',
      interests: ['Drama', 'Thriller', 'Sci-Fi', 'Romance'],
      preferredGender: ['female'],
      preferredAgeMin: 23,
      preferredAgeMax: 30,
    },
    {
      email: 'alex@example.com',
      name: 'Alex',
      age: 25,
      gender: 'male',
      bio: 'Movie buff with a passion for classic films and modern masterpieces.',
      location: 'Barcelona, Spain',
      interests: ['Comedy', 'Action', 'Sci-Fi', 'Fantasy'],
      preferredGender: ['female'],
      preferredAgeMin: 22,
      preferredAgeMax: 28,
    },
    {
      email: 'maria@example.com',
      name: 'Maria',
      age: 27,
      gender: 'female',
      bio: 'Art house cinema enthusiast. Looking for someone to share popcorn and opinions with.',
      location: 'Paris, France',
      interests: ['Drama', 'Romance', 'Foreign Films', 'Documentary'],
      preferredGender: ['male', 'female'],
      preferredAgeMin: 25,
      preferredAgeMax: 32,
    },
    {
      email: 'james@example.com',
      name: 'James',
      age: 29,
      gender: 'male',
      bio: 'Horror and thriller fan. Love discussing plot twists and cinematography.',
      location: 'London, UK',
      interests: ['Horror', 'Thriller', 'Mystery', 'Sci-Fi'],
      preferredGender: ['female'],
      preferredAgeMin: 24,
      preferredAgeMax: 32,
    },
    {
      email: 'sofia@example.com',
      name: 'Sofia',
      age: 23,
      gender: 'female',
      bio: 'Rom-com addict with a soft spot for indie films. Let\'s watch something together!',
      location: 'Rome, Italy',
      interests: ['Romance', 'Comedy', 'Drama', 'Musical'],
      preferredGender: ['male'],
      preferredAgeMin: 22,
      preferredAgeMax: 30,
    },
    {
      email: 'david@example.com',
      name: 'David',
      age: 30,
      gender: 'male',
      bio: 'Film critic and cinema enthusiast. Always discovering hidden gems.',
      location: 'New York, USA',
      interests: ['Drama', 'Documentary', 'Thriller', 'Biography'],
      preferredGender: ['female'],
      preferredAgeMin: 25,
      preferredAgeMax: 35,
    },
    {
      email: 'lisa@example.com',
      name: 'Lisa',
      age: 26,
      gender: 'female',
      bio: 'Animation and fantasy lover. Disney princess at heart but love dark films too.',
      location: 'Tokyo, Japan',
      interests: ['Animation', 'Fantasy', 'Adventure', 'Drama'],
      preferredGender: ['male', 'female'],
      preferredAgeMin: 24,
      preferredAgeMax: 30,
    },
    {
      email: 'michael@example.com',
      name: 'Michael',
      age: 27,
      gender: 'male',
      bio: 'Action and sci-fi enthusiast. Marvel fan but appreciate all good cinema.',
      location: 'Los Angeles, USA',
      interests: ['Action', 'Sci-Fi', 'Adventure', 'Fantasy'],
      preferredGender: ['female'],
      preferredAgeMin: 23,
      preferredAgeMax: 30,
    },
    {
      email: 'anna@example.com',
      name: 'Anna',
      age: 25,
      gender: 'female',
      bio: 'Period drama and historical film lover. Looking for my movie marathon partner.',
      location: 'Vienna, Austria',
      interests: ['Drama', 'Historical', 'Romance', 'Biography'],
      preferredGender: ['male'],
      preferredAgeMin: 24,
      preferredAgeMax: 32,
    },
    {
      email: 'carlos@example.com',
      name: 'Carlos',
      age: 28,
      gender: 'male',
      bio: 'Latin cinema and world films enthusiast. Love exploring different cultures through movies.',
      location: 'Buenos Aires, Argentina',
      interests: ['Drama', 'Foreign Films', 'Documentary', 'Romance'],
      preferredGender: ['female'],
      preferredAgeMin: 24,
      preferredAgeMax: 32,
    },
  ];

  // Different film posters for variety
  const filmPosters = [
    ['https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', 'https://image.tmdb.org/t/p/w500/vzmL6fP7aPKNKPRTFnZmiUfciyV.jpg', 'https://image.tmdb.org/t/p/w500/yFihWxQcmqcaBR31QM6Y8gT6aYV.jpg', 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg'],
    ['https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', 'https://image.tmdb.org/t/p/w500/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg', 'https://image.tmdb.org/t/p/w500/xBKGJQsAIeweesB79KC89FpBrVr.jpg', 'https://image.tmdb.org/t/p/w500/kqjL17yufvn9OVLyXYpvtyrFfak.jpg'],
    ['https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', 'https://image.tmdb.org/t/p/w500/lHu1wtNaczFPGFDTrjCSzeLPTKN.jpg', 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', 'https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg'],
    ['https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', 'https://image.tmdb.org/t/p/w500/aKx1ARwG55zZ0GpRvU2WrGrCG9o.jpg', 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg', 'https://image.tmdb.org/t/p/w500/dqK9Hag1054tghRQSqLSfrkvQnA.jpg'],
    ['https://image.tmdb.org/t/p/w500/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg', 'https://image.tmdb.org/t/p/w500/yDHYTfA3R0jFYba16jBB1ef8oIt.jpg', 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', 'https://image.tmdb.org/t/p/w500/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg'],
    ['https://image.tmdb.org/t/p/w500/npSqWAB5PfKFWWZXs0mPWO6NpAv.jpg', 'https://image.tmdb.org/t/p/w500/xmbU4JTUm8rsdtn7Y3Fcm30GpeT.jpg', 'https://image.tmdb.org/t/p/w500/bOGkgRGdhrBYJSLpXaxhXVstddV.jpg', 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg'],
  ];

  // Create users and profiles
  for (let i = 0; i < profiles.length; i++) {
    const profileData = profiles[i];
    const { email, name, age, gender, bio, location, photos, interests, preferredGender, preferredAgeMin, preferredAgeMax } = profileData;

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        profile: {
          create: {
            name,
            age,
            gender,
            bio,
            location,
            interests,
            photos: photos || [],
            topFilms: filmPosters[i % filmPosters.length],
            preferredGender,
            preferredAgeMin,
            preferredAgeMax,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    console.log(`✅ Created user: ${user.email} with profile: ${user.profile?.name}`);
  }

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
