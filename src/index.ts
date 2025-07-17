import express from "express";
import cors from "cors";
import publicPropertyRoutes from "./routes/public/propertyRoutes";
import tenantPropertyRoutes from "./routes/tenant/propertyRoutes";
import tenantRoomRoutes from "./routes/tenant/roomRoutes";
import tenantCategoryRoutes from "./routes/tenant/categoryRoutes";
import tenantPeakSeasonRoutes from "./routes/tenant/peakSeasonRoutes";
import tenantRoomUnavailabilityRoutes from "./routes/tenant/roomUnavailabilityRoutes";
import pictureRoutes from "./routes/pictureRoutes";
import userRoutes from "./routes/userRoutes";

const app = express();
const PORT = 8000;

app.use(cors());

app.use(express.json());

// Routes
app.use("/properties", publicPropertyRoutes);
app.use("/tenant/properties", tenantPropertyRoutes);
app.use("/tenant/rooms", tenantRoomRoutes);
app.use("/tenant/categories", tenantCategoryRoutes);
app.use("/tenant/peak-seasons", tenantPeakSeasonRoutes);
app.use("/tenant/unavailabilities", tenantRoomUnavailabilityRoutes);
app.use("/pictures", pictureRoutes);
app.use("/users", userRoutes);

// Global error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
