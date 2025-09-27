import { Request, Response } from "express";
import LeadGroup from "../models/LeadGroup";
import LeadGroupAssignment from "../models/LeadGroupAssignment";
import User from "../models/User.model";
const createLeadGroupWithUsers = async (req: Request, res: Response) => {
  try {
    const { groupName, userIds } = req.body;
    console.log("there are got ")
    if (!groupName || !Array.isArray(userIds)) {
      res.status(400).json({ message: "groupName and userIds are required." });
    }

    // 1. Create Group
    const group = await LeadGroup.create({ groupName });

    // 2. Assign Users
    const assignments = userIds.map((userId: number) => ({
      userId,
      groupId: group.id,
    }));

    await LeadGroupAssignment.bulkCreate(assignments);

    res.status(201).json({
      message: "Group created and users assigned.",
      group,
    });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
const getAllLeadGroupsWithUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 25;
    const offset = (page - 1) * limit;

    const type = req.query.type as "Retail" | "wholeSale" | undefined;

    // 1. Count total groups
    const totalItems = await LeadGroup.count();

    // 2. Fetch paginated groups with associated users
    const groups = await LeadGroup.findAll({
      offset,
      limit,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: LeadGroupAssignment,
          as: "LeadGroupAssignments",
          include: [{ model: User, as: "User" }],
        },
      ],
    });

    // 3. Filter users based on type
    const groupData = groups
      .map((group) => {
        const assignments = (group as any).LeadGroupAssignments || [];
        let filteredUsers = assignments.map((a: any) => a.User);

        if (type === "wholeSale") {
          filteredUsers = filteredUsers.filter((u: any) => u.role === 3);
        } else if (type === "Retail") {
          filteredUsers = filteredUsers.filter((u: any) => u.role !== 3);
        }

        return {
          id: group.id,
          groupName: group.groupName,
          createdAt: group.createdAt,
          totalLeads: filteredUsers.length,
          users: filteredUsers,
        };
      })
      .filter((g) => g.users.length > 0); // only include groups with users after filter

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      data: groupData,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


const getAllLeadGroupsWithID = async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id);

    if (isNaN(groupId)) {
      res.status(400).json({ message: "Invalid group ID." });
    }

    const group = await LeadGroup.findOne({
      where: { id: groupId },
      include: [
        {
          model: LeadGroupAssignment,
          as: "LeadGroupAssignments",
          include: [{ model: User, as: "User" }],
        },
      ],
    });

    if (!group) {
      res.status(404).json({ message: "Group not found." });
      return;
    }

    const assignments = (group as any).LeadGroupAssignments || [];
    const users = assignments.map((a: any) => a.User);

    res.status(200).json({
      id: group.id,
      groupName: group.groupName,
      createdAt: group.createdAt,
      totalLeads: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching group by ID:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
const updateLeadGroupWithUsers = async (req: Request, res: Response) => {
  try {
    const { groupName, userIds } = req.body || {};
      console.log(req.body)
    const groupId = parseInt(req.params.id);  

    if (!groupName || !Array.isArray(userIds) || isNaN(groupId)) {
      res.status(400).json({ message: "groupName, userIds, and valid group ID are required." });
    }

    const group = await LeadGroup.findByPk(groupId);
    if (!group) {
       res.status(404).json({ message: "Group not found." });
       return
    }

    await group.update({ groupName });

    await LeadGroupAssignment.destroy({ where: { groupId } });

    const newAssignments = userIds.map((userId: number) => ({
      userId,
      groupId,
    }));
    await LeadGroupAssignment.bulkCreate(newAssignments);

    res.status(200).json({ message: "Group updated successfully." });
  } catch (error) {
    console.error("Error updating group:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
const deleteLeadGroupById = async (req: Request, res: Response) => {
  try {
    const groupId = parseInt(req.params.id);
      console.log(groupId)
    // Validate ID
    if (isNaN(groupId)) {
       res.status(400).json({ message: "Invalid group ID." });
    }

    // Check if group exists
    const group = await LeadGroup.findByPk(groupId);
    if (!group) {
       res.status(404).json({ message: "Group not found." });
       return
    }

    // Delete assignments first (foreign key constraint)
    await LeadGroupAssignment.destroy({ where: { groupId } });

    // Delete group
    await group.destroy();

    res.status(200).json({ message: "Group and its assignments deleted successfully." });
  } catch (error) {
    console.error("Error deleting group:", error);
     res.status(500).json({ message: "Internal server error." });
  }
};

export {
  createLeadGroupWithUsers,
  getAllLeadGroupsWithUsers,
  getAllLeadGroupsWithID,
  updateLeadGroupWithUsers,
  deleteLeadGroupById
};
