import { config } from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

config();

const rawUsers = [
  // Female Colleagues
  {
    email: "emma.thompson@example.com",
    fullName: "Emma Thompson",
    profilePic: "https://randomuser.me/api/portraits/women/1.jpg",
    role: "Lead Product Designer",
    department: "Design",
    labels: ["Design", "Product"],
  },
  {
    email: "olivia.miller@example.com",
    fullName: "Olivia Miller",
    profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
    role: "Senior Frontend Engineer",
    department: "Dev",
    labels: ["Dev", "Design"],
  },
  {
    email: "sophia.davis@example.com",
    fullName: "Sophia Davis",
    profilePic: "https://randomuser.me/api/portraits/women/3.jpg",
    role: "Growth Marketing Lead",
    department: "Marketing",
    labels: ["Marketing"],
  },
  {
    email: "ava.wilson@example.com",
    fullName: "Ava Wilson",
    profilePic: "https://randomuser.me/api/portraits/women/4.jpg",
    role: "QA Automation Lead",
    department: "Testing",
    labels: ["Testing", "Dev"],
  },
  {
    email: "isabella.brown@example.com",
    fullName: "Isabella Brown",
    profilePic: "https://randomuser.me/api/portraits/women/5.jpg",
    role: "Product Manager",
    department: "Product",
    labels: ["Product", "Marketing"],
  },
  {
    email: "mia.johnson@example.com",
    fullName: "Mia Johnson",
    profilePic: "https://randomuser.me/api/portraits/women/6.jpg",
    role: "Backend Systems Architect",
    department: "Dev",
    labels: ["Dev"],
  },
  {
    email: "charlotte.williams@example.com",
    fullName: "Charlotte Williams",
    profilePic: "https://randomuser.me/api/portraits/women/7.jpg",
    role: "Content & Brand Strategist",
    department: "Marketing",
    labels: ["Marketing", "Design"],
  },
  {
    email: "amelia.garcia@example.com",
    fullName: "Amelia Garcia",
    profilePic: "https://randomuser.me/api/portraits/women/8.jpg",
    role: "Security & QA Analyst",
    department: "Testing",
    labels: ["Testing"],
  },

  // Male Colleagues
  {
    email: "james.anderson@example.com",
    fullName: "James Anderson",
    profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
    role: "Staff Full-Stack Developer",
    department: "Dev",
    labels: ["Dev", "Product"],
  },
  {
    email: "william.clark@example.com",
    fullName: "William Clark",
    profilePic: "https://randomuser.me/api/portraits/men/2.jpg",
    role: "DevOps & Cloud Engineer",
    department: "Dev",
    labels: ["Dev", "Testing"],
  },
  {
    email: "benjamin.taylor@example.com",
    fullName: "Benjamin Taylor",
    profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
    role: "Performance Marketing Specialist",
    department: "Marketing",
    labels: ["Marketing"],
  },
  {
    email: "lucas.moore@example.com",
    fullName: "Lucas Moore",
    profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
    role: "UI/UX Interaction Designer",
    department: "Design",
    labels: ["Design"],
  },
  {
    email: "henry.jackson@example.com",
    fullName: "Henry Jackson",
    profilePic: "https://randomuser.me/api/portraits/men/5.jpg",
    role: "QA Release Coordinator",
    department: "Testing",
    labels: ["Testing", "Product"],
  },
  {
    email: "alexander.martin@example.com",
    fullName: "Alexander Martin",
    profilePic: "https://randomuser.me/api/portraits/men/6.jpg",
    role: "Engineering Manager",
    department: "Dev",
    labels: ["Dev", "Product"],
  },
  {
    email: "daniel.rodriguez@example.com",
    fullName: "Daniel Rodriguez",
    profilePic: "https://randomuser.me/api/portraits/men/7.jpg",
    role: "Product Analytics Lead",
    department: "Product",
    labels: ["Product", "Marketing"],
  },
];

// Local high-reliability SVG media assets served directly by Vite from frontend/public/media/
const SAMPLE_MEDIA_IMAGES = [
  "/media/dashboard-preview.svg",
  "/media/architecture-flow.svg",
  "/media/design-system.svg",
  "/media/sprint-metrics.svg",
];

const buildSampleConversation = (primaryUser, partnerUser, index) => {
  const now = Date.now();
  const baseOffset = (index + 1) * 3600 * 1000;

  return [
    {
      senderId: partnerUser._id,
      receiverId: primaryUser._id,
      text: `Hey ${primaryUser.fullName.split(" ")[0]}! Here is the workspace link for the ${partnerUser.department} sync: https://github.com/chatty-workspace/sprint-board`,
      isRead: true,
      createdAt: new Date(now - baseOffset - 1800 * 1000),
      updatedAt: new Date(now - baseOffset - 1800 * 1000),
    },
    {
      senderId: primaryUser._id,
      receiverId: partnerUser._id,
      text: `Awesome, thanks ${partnerUser.fullName.split(" ")[0]}! I also reviewed the Figma specs at https://figma.com/file/chatty-ui-redesign and everything looks super clean.`,
      isRead: true,
      createdAt: new Date(now - baseOffset - 1200 * 1000),
      updatedAt: new Date(now - baseOffset - 1200 * 1000),
    },
    {
      senderId: partnerUser._id,
      receiverId: primaryUser._id,
      text: "Here are the latest visual snapshots from our sprint:",
      image: SAMPLE_MEDIA_IMAGES[index % SAMPLE_MEDIA_IMAGES.length],
      isRead: true,
      createdAt: new Date(now - baseOffset - 900 * 1000),
      updatedAt: new Date(now - baseOffset - 900 * 1000),
    },
    {
      senderId: primaryUser._id,
      receiverId: partnerUser._id,
      text: "And here is the secondary dashboard preview for the team:",
      image: SAMPLE_MEDIA_IMAGES[(index + 1) % SAMPLE_MEDIA_IMAGES.length],
      isRead: true,
      createdAt: new Date(now - baseOffset - 600 * 1000),
      updatedAt: new Date(now - baseOffset - 600 * 1000),
    },
    {
      senderId: partnerUser._id,
      receiverId: primaryUser._id,
      text: "Let's finalize this before the 3 PM standup!",
      image: index < 2 ? SAMPLE_MEDIA_IMAGES[(index + 2) % SAMPLE_MEDIA_IMAGES.length] : undefined,
      isRead: index > 2,
      createdAt: new Date(now - baseOffset - 120 * 1000),
      updatedAt: new Date(now - baseOffset - 120 * 1000),
    },
  ];
};

const seedDatabase = async () => {
  try {
    await connectDB();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    const upsertedUsers = [];
    for (const u of rawUsers) {
      const user = await User.findOneAndUpdate(
        { email: u.email },
        {
          $set: {
            fullName: u.fullName,
            profilePic: u.profilePic,
            role: u.role,
            department: u.department,
            labels: u.labels,
          },
          $setOnInsert: {
            email: u.email,
            password: hashedPassword,
          },
        },
        { upsert: true, new: true }
      );
      upsertedUsers.push(user);
    }

    console.log(`✅ Upserted ${upsertedUsers.length} workplace colleagues (password: 123456)`);

    // Replace any old broken Unsplash image URLs in existing messages with reliable local SVG assets
    const brokenMessages = await Message.find({
      image: { $regex: "images.unsplash.com" },
    });

    for (let i = 0; i < brokenMessages.length; i++) {
      brokenMessages[i].image = SAMPLE_MEDIA_IMAGES[i % SAMPLE_MEDIA_IMAGES.length];
      await brokenMessages[i].save();
    }

    if (brokenMessages.length > 0) {
      console.log(
        `✅ Replaced ${brokenMessages.length} broken external image attachments with local SVG media assets.`
      );
    }

    const allUsers = await User.find({});
    const existingMessagesCount = await Message.countDocuments();

    if (existingMessagesCount < 25 && allUsers.length >= 2) {
      const messagesToInsert = [];
      const primaryUser =
        allUsers.find((u) => !rawUsers.some((ru) => ru.email === u.email)) ||
        allUsers[0];

      const partners = allUsers
        .filter((u) => u._id.toString() !== primaryUser._id.toString())
        .slice(0, 6);

      partners.forEach((partner, idx) => {
        messagesToInsert.push(...buildSampleConversation(primaryUser, partner, idx));
      });

      if (upsertedUsers.length >= 4 && primaryUser._id.equals(upsertedUsers[0]._id) === false) {
        messagesToInsert.push(
          ...buildSampleConversation(upsertedUsers[0], upsertedUsers[1], 1),
          ...buildSampleConversation(upsertedUsers[0], upsertedUsers[2], 2)
        );
      }

      await Message.insertMany(messagesToInsert);
      console.log(
        `✅ Seeded ${messagesToInsert.length} rich workplace messages (with local media & links) for ${primaryUser.email}`
      );
    }

    console.log("\n🎉 Database seed complete!");
    console.log("👉 Demo Login: emma.thompson@example.com / 123456");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

seedDatabase();