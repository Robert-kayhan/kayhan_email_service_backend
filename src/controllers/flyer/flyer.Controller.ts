import { Request, Response } from "express";
import Flyer from "../../models/flyer/Flyer";
import ProductSpecification from "../../models/flyer/Specification";
import { generateStyledFlyerPdf } from "../../utils/generateStyledFlyerPdf";
import generateSingleStyledFlyerPdf from "../../utils/generateStyledFlyerSinglePdf";
import { sendEmail } from "../../utils/sendEmail";
import {
  generateStyledFlyerImage,
  generateStyledSingleFlyerImage,
} from "../../utils/convertPdfToJpg";

type SpecificationItem = {
  title: string;
  description: string;
};

type FlyerSpecRow = {
  feature: string;
  p1: string;
  p2: string;
};

function validateFlyerData(data: any): string[] {
  const errors: string[] = [];

  if (!data.title || typeof data.title !== "string" || data.title.trim() === "") {
    errors.push("Title is required and must be a non-empty string.");
  }

  if (data.description && typeof data.description !== "string") {
    errors.push("Description must be a string.");
  }

  return errors;
}

function parseSpecifications(specifications: any): SpecificationItem[] {
  try {
    if (!specifications) return [];

    if (Array.isArray(specifications)) {
      return specifications.filter(
        (item) =>
          item &&
          typeof item.title === "string" &&
          typeof item.description === "string"
      );
    }

    if (typeof specifications === "string") {
      const parsed = JSON.parse(specifications);

      if (!Array.isArray(parsed)) return [];

      return parsed.filter(
        (item) =>
          item &&
          typeof item.title === "string" &&
          typeof item.description === "string"
      );
    }

    return [];
  } catch (error) {
    console.error("Error parsing specifications:", error);
    return [];
  }
}

function getAllSpecifications(productSpec: any): SpecificationItem[] {
  return parseSpecifications(productSpec?.specifications);
}

function buildSingleProductSpecs(productSpecOne: any): FlyerSpecRow[] {
  const specs1 = getAllSpecifications(productSpecOne);

  return specs1.map((item) => ({
    feature: item.title,
    p1: item.description || "-",
    p2: "-",
  }));
}

function buildDoubleProductSpecs(
  productSpecOne: any,
  productSpecTwo: any
): FlyerSpecRow[] {
  const specs1 = getAllSpecifications(productSpecOne);
  const specs2 = getAllSpecifications(productSpecTwo);

  const featureMap: Record<string, { p1: string; p2: string }> = {};

  specs1.forEach((item) => {
    featureMap[item.title] = {
      p1: item.description || "-",
      p2: "-",
    };
  });

  specs2.forEach((item) => {
    if (featureMap[item.title]) {
      featureMap[item.title].p2 = item.description || "-";
    } else {
      featureMap[item.title] = {
        p1: "-",
        p2: item.description || "-",
      };
    }
  });

  return Object.entries(featureMap).map(([feature, values]) => ({
    feature,
    p1: values.p1,
    p2: values.p2,
  }));
}

const createsFlyer = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validateFlyerData(req.body);

    if (errors.length > 0) {
      res.status(400).json({ success: false, errors });
      return;
    }

    const {
      title,
      description,
      prodcutoneimageUrl,
      productOnePrice,
      productTwoPrice,
      prodcutwoimageUrl,
      productSpecificationId,
      productSpecificationIdtwo,
      customerName,
      customerPhone,
      customerEmail,
      installationFees,
      deliveryFees,
      quotationNumber,
      validationTime,
      CrmID,
    } = req.body;

    const [productSpecOne, productSpecTwo]: any = await Promise.all([
      productSpecificationId
        ? ProductSpecification.findByPk(productSpecificationId)
        : null,
      productSpecificationIdtwo
        ? ProductSpecification.findByPk(productSpecificationIdtwo)
        : null,
    ]);

    if (productSpecificationId && !productSpecOne) {
      res.status(400).json({
        success: false,
        message: "Invalid productSpecificationIdOne",
      });
      return;
    }

    if (productSpecificationIdtwo && !productSpecTwo) {
      res.status(400).json({
        success: false,
        message: "Invalid productSpecificationIdTwo",
      });
      return;
    }

    const specs = buildDoubleProductSpecs(productSpecOne, productSpecTwo);

    const pdfPath = await generateStyledFlyerPdf({
      flyerData: {
        customerName,
        customerPhone,
        customerEmail,
        installationFees,
        deliveryFees,
        quotationNumber,
        validationTime,
        logoUrl: "/logo.jpg",
      },
      firstProduct: {
        image: prodcutoneimageUrl,
        title: productSpecOne?.name || "Product One",
        price: productOnePrice,
      },
      secondProduct: {
        image: prodcutwoimageUrl,
        title: productSpecTwo?.name || "Product Two",
        price: productTwoPrice,
      },
      specs,
    });

    const jpgfile = await generateStyledFlyerImage({
      flyerData: {
        customerName,
        customerPhone,
        customerEmail,
        installationFees,
        deliveryFees,
        quotationNumber,
        validationTime,
        logoUrl: "/logo.jpg",
      },
      firstProduct: {
        image: prodcutoneimageUrl,
        title: productSpecOne?.name || "Product One",
        price: productOnePrice,
      },
      secondProduct: {
        image: prodcutwoimageUrl,
        title: productSpecTwo?.name || "Product Two",
        price: productTwoPrice,
      },
      specs,
    });

    const flyerDataToSave = {
      title,
      description,
      productOneImageUrl: prodcutoneimageUrl,
      productTwoImageUrl: prodcutwoimageUrl,
      productSpecificationIdOne: productSpecificationId,
      productSpecificationIdTwo: productSpecificationIdtwo,
      customerName,
      customerPhone,
      customerEmail,
      installationFees,
      deliveryFees,
      quotationNumber,
      validationTime,
      flyer_url: pdfPath,
      flyer_image_url: jpgfile,
      CrmID: CrmID || "",
    };

    let flyer;

    if (CrmID) {
      flyer = await Flyer.findOne({ where: { CrmID } });

      if (flyer) {
        await flyer.update(flyerDataToSave);

        res.status(200).json({
          success: true,
          message: "Flyer updated successfully",
          data: flyer,
        });
        return;
      }
    }

    flyer = await Flyer.create(flyerDataToSave);

    res.status(201).json({
      success: true,
      message: "Flyer created successfully",
      data: flyer,
    });
  } catch (error: any) {
    console.error("Error creating flyer:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllFlyers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const totalFlyers = await Flyer.count();

    const flyers = await Flyer.findAll({
      offset,
      limit,
      order: [["createdAt", "DESC"]],
    });

    res.json({
      success: true,
      data: flyers,
      pagination: {
        total: totalFlyers,
        page,
        limit,
        totalPages: Math.ceil(totalFlyers / limit),
        hasNextPage: page < Math.ceil(totalFlyers / limit),
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching flyers:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFlyerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const flyer = await Flyer.findByPk(req.params.id);

    if (!flyer) {
      res.status(404).json({ success: false, message: "Flyer not found" });
      return;
    }

    res.json({ success: true, data: flyer });
  } catch (error: any) {
    console.error("Error fetching flyer:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateFlyer = async (req: Request, res: Response): Promise<void> => {
  try {
    const flyer = await Flyer.findByPk(req.params.id);

    if (!flyer) {
      res.status(404).json({ success: false, message: "Flyer not found" });
      return;
    }

    const errors = validateFlyerData(req.body);

    if (errors.length > 0) {
      res.status(400).json({ success: false, errors });
      return;
    }

    await flyer.update(req.body);

    res.json({
      success: true,
      message: "Flyer updated successfully",
      data: flyer,
    });
  } catch (error: any) {
    console.error("Error updating flyer:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFlyer = async (req: Request, res: Response): Promise<void> => {
  try {
    const flyer = await Flyer.findByPk(req.params.id);

    if (!flyer) {
      res.status(404).json({ success: false, message: "Flyer not found" });
      return;
    }

    await flyer.destroy();

    res.json({ success: true, message: "Flyer deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting flyer:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSingleProdctFlyer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const errors = validateFlyerData(req.body);

    if (errors.length > 0) {
      res.status(400).json({ success: false, errors });
      return;
    }

    const {
      title,
      description,
      prodcutoneimageUrl,
      prodcutwoimageUrl,
      productSpecificationId,
      productSpecificationIdtwo,
      customerName,
      customerPhone,
      customerEmail,
      installationFees,
      deliveryFees,
      quotationNumber,
      validationTime,
      CrmID,
      productOnePrice,
      productTwoPrice,
    } = req.body;

    const [productSpecOne, productSpecTwo]: any = await Promise.all([
      productSpecificationId
        ? ProductSpecification.findByPk(productSpecificationId)
        : null,
      productSpecificationIdtwo
        ? ProductSpecification.findByPk(productSpecificationIdtwo)
        : null,
    ]);

    if (productSpecificationId && !productSpecOne) {
      res.status(400).json({
        success: false,
        message: "Invalid productSpecificationIdOne",
      });
      return;
    }

    if (productSpecificationIdtwo && !productSpecTwo) {
      res.status(400).json({
        success: false,
        message: "Invalid productSpecificationIdTwo",
      });
      return;
    }

    const specs = buildSingleProductSpecs(productSpecOne);

    const pdfPath = await generateSingleStyledFlyerPdf({
      flyerData: {
        customerName,
        customerPhone,
        customerEmail,
        installationFees,
        deliveryFees,
        quotationNumber,
        validationTime,
        logoUrl: "/logo.jpg",
      },
      firstProduct: {
        image: prodcutoneimageUrl,
        title: productSpecOne?.name || "Product One",
        price: productOnePrice,
      },
      secondProduct: {
        image: prodcutwoimageUrl,
        title: productSpecTwo?.name || "Product Two",
        price: productTwoPrice,
      },
      specs,
    });

    const jpgfile = await generateStyledSingleFlyerImage({
      flyerData: {
        customerName,
        customerPhone,
        customerEmail,
        installationFees,
        deliveryFees,
        quotationNumber,
        validationTime,
        logoUrl: "/logo.jpg",
      },
      firstProduct: {
        image: prodcutoneimageUrl,
        title: productSpecOne?.name || "Product One",
        price: productOnePrice,
      },
      secondProduct: {
        image: prodcutwoimageUrl,
        title: productSpecTwo?.name || "Product Two",
        price: productTwoPrice,
      },
      specs,
    });

    const flyerDataToSave = {
      title,
      description,
      productOneImageUrl: prodcutoneimageUrl,
      productTwoImageUrl: prodcutwoimageUrl,
      productSpecificationIdOne: productSpecificationId,
      productSpecificationIdTwo: productSpecificationIdtwo,
      customerName,
      customerPhone,
      customerEmail,
      installationFees,
      deliveryFees,
      quotationNumber,
      validationTime,
      flyer_url: pdfPath,
      flyer_image_url: jpgfile,
      CrmID: CrmID || "",
    };

    let flyer;

    if (CrmID) {
      flyer = await Flyer.findOne({ where: { CrmID } });

      if (flyer) {
        await flyer.update(flyerDataToSave);

        res.status(200).json({
          success: true,
          message: "Flyer updated successfully",
          data: flyer,
          pdf: pdfPath,
        });
        return;
      }
    }

    flyer = await Flyer.create(flyerDataToSave);

    res.status(201).json({
      success: true,
      message: "Flyer created successfully",
      data: flyer,
      pdf: pdfPath,
    });
  } catch (error: any) {
    console.error("Error creating single product flyer:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const sendFlyer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userData, combinedHtml, subject } = req.body;

    const result = await sendEmail({
      subject: subject || "Kayhan Audio Flyer",
      to: userData.email,
      bodyHtml: combinedHtml,
      from: "support@mailer.kayhanaudio.com.au",
    });

    res.status(200).json({
      success: true,
      message: "Flyer sent successfully",
      messageId: result.MessageId,
    });
  } catch (error: any) {
    console.error("Error sending flyer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send flyer",
      error: error.message,
    });
  }
};

export {
  createsFlyer,
  getAllFlyers,
  getFlyerById,
  updateFlyer,
  deleteFlyer,
  createSingleProdctFlyer,
  sendFlyer,
};