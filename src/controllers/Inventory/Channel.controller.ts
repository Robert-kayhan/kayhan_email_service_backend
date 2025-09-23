import { Request, Response } from "express";
import Channel from "../../models/Inventory/Channel";
import { Op } from "sequelize";

// Create a new channel
const createChannel = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      res.status(400).json({ message: "Name and description are required" });
      return;
    }

    const existingChannel = await Channel.findOne({ where: { name } });
    if (existingChannel) {
      res
        .status(409)
        .json({ message: "Channel with this name already exists" });
      return;
    }

    const channel = await Channel.create({ name, description });
    res.status(201).json(channel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create channel", error });
  }
};

const getAllChannels = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10", search = "" } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const offset = (pageNumber - 1) * pageSize;

    // Build where condition for search
    const whereCondition = search
      ? {
          name: {
            [Op.like]: `%${search}%`,
          },
        }
      : {};

    const { count, rows: channels } = await Channel.findAndCountAll({
      where: whereCondition,
      limit: pageSize,
      offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      data: channels,
      meta: {
        total: count,
        page: pageNumber,
        lastPage: Math.ceil(count / pageSize),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch channels", error });
  }
};

const getChannelById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findByPk(id);
    if (!channel) {
       res.status(404).json({ message: "Channel not found" });
       return
    }
    res.status(200).json(channel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch channel", error });
  }
};

const updateChannel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const channel = await Channel.findByPk(id);
    if (!channel) {
       res.status(404).json({ message: "Channel not found" });
       return
    }

    channel.name = name ?? channel.name;
    channel.description = description ?? channel.description;
    await channel.save();

    res.status(200).json(channel);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update channel", error });
  }
};

const deleteChannel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const channel = await Channel.findByPk(id);
    if (!channel) {
       res.status(404).json({ message: "Channel not found" });
       return
    }

    await channel.destroy();
    res.status(200).json({ message: "Channel deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete channel", error });
  }
};

export {
  createChannel,
  getAllChannels,
  getChannelById,
  deleteChannel,
  updateChannel,
};
