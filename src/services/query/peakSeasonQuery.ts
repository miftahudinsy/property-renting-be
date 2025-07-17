import { PrismaClient } from "../../../generated/prisma";
import {
  ValidatedCreatePeakSeasonParams,
  ValidatedUpdatePeakSeasonParams,
  ValidatedDeletePeakSeasonParams,
  ValidatedListPeakSeasonParams,
} from "../validation/peakSeasonValidation";

const prisma = new PrismaClient();

export const createPeakSeasonRate = async (
  params: ValidatedCreatePeakSeasonParams,
  tenantId: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  const { roomId, type, value, startDate, endDate } = params;

  const room = await prisma.rooms.findFirst({
    where: { id: roomId, properties: { tenant_id: tenantId } },
  });

  if (!room) {
    return {
      success: false,
      message: "Kamar tidak ditemukan atau Anda tidak punya akses.",
    };
  }

  const overlappingRates = await prisma.peak_season_rates.findMany({
    where: {
      room_id: roomId,
      start_date: { lt: endDate },
      end_date: { gt: startDate },
    },
  });

  if (overlappingRates.length > 0) {
    return {
      success: false,
      message: "Sudah ada tarif musim puncak pada rentang tanggal tersebut.",
    };
  }

  const data = await prisma.peak_season_rates.create({
    data: {
      room_id: roomId,
      type,
      value,
      start_date: startDate,
      end_date: endDate,
    },
  });

  return {
    success: true,
    message: "Tarif musim puncak berhasil ditambahkan.",
    data,
  };
};

export const updatePeakSeasonRateById = async (
  params: ValidatedUpdatePeakSeasonParams,
  tenantId: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  const { id, type, value, startDate, endDate } = params;

  const rate = await prisma.peak_season_rates.findFirst({
    where: { id, rooms: { properties: { tenant_id: tenantId } } },
  });

  if (!rate) {
    return {
      success: false,
      message: "Tarif tidak ditemukan atau Anda tidak punya akses.",
    };
  }

  const updatedData = await prisma.peak_season_rates.update({
    where: { id },
    data: {
      type: type,
      value: value,
      start_date: startDate,
      end_date: endDate,
    },
  });

  return {
    success: true,
    message: "Tarif musim puncak berhasil diperbarui.",
    data: updatedData,
  };
};

export const deletePeakSeasonRateById = async (
  params: ValidatedDeletePeakSeasonParams,
  tenantId: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  const { id } = params;

  const rate = await prisma.peak_season_rates.findFirst({
    where: { id, rooms: { properties: { tenant_id: tenantId } } },
  });

  if (!rate) {
    return {
      success: false,
      message: "Tarif tidak ditemukan atau Anda tidak punya akses.",
    };
  }

  await prisma.peak_season_rates.delete({ where: { id } });

  return { success: true, message: "Tarif musim puncak berhasil dihapus." };
};

export const getPeakSeasonRatesByRoom = async (
  params: ValidatedListPeakSeasonParams,
  tenantId: string
): Promise<{ success: boolean; message: string; data?: any[] }> => {
  const { roomId, startDate, endDate } = params;

  const room = await prisma.rooms.findFirst({
    where: { id: roomId, properties: { tenant_id: tenantId } },
  });

  if (!room) {
    return {
      success: false,
      message: "Kamar tidak ditemukan atau Anda tidak punya akses.",
    };
  }

  const where: any = { room_id: roomId };
  if (startDate && endDate) {
    where.AND = [
      { start_date: { lt: endDate } },
      { end_date: { gt: startDate } },
    ];
  }

  const rates = await prisma.peak_season_rates.findMany({
    where,
    orderBy: { start_date: "asc" },
  });

  return { success: true, message: "Data berhasil diambil.", data: rates };
};
