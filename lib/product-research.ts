export type Channel = "Website" | "Facebook" | "Marketplace" | "Retail";

export type ProductInputs = {
  productName: string;
  supplier: string;
  buyingCostPerUnit: number;
  unitsBought: number;
  deliveryCostPerOrder: number;
  packagingCostPerOrder: number;
  averageAdCostPerOrder: number;
  failedOrderRate: number;
  returnLossPerFailedOrder: number;
  targetNetProfitPerOrder: number;
  manualTargetSellPrice: number;
};

export type CompetitorEntry = {
  id?: string;
  date: string;
  competitor: string;
  productLinks?: string[];
  productUrl?: string;
  channel: Channel;
  listedPrice: number;
  customDeliveryFee?: number;
  notes?: string;
};

export type SalesStatus = "Delivered" | "Returned" | "Pending";

export type SalesEntry = {
  date: string;
  customer: string;
  channel: string;
  sellPrice: number;
  status: SalesStatus;
  notes?: string;
};

export type ResearchDataset = {
  product: ProductInputs;
  competitors: CompetitorEntry[];
  salesLog: SalesEntry[];
  scenarioUnitsSold: number;
  storage: {
    provider: "neon" | "local";
  };
};

export type StrategyScenario = {
  name: string;
  label: string;
  buyCostPerUnit: number;
  sellPrice: number;
};

export const fallbackDataset: ResearchDataset = {
  product: {
    productName: "Mini Multi Cooker",
    supplier: "Example supplier",
    buyingCostPerUnit: 1100,
    unitsBought: 20,
    deliveryCostPerOrder: 120,
    packagingCostPerOrder: 30,
    averageAdCostPerOrder: 200,
    failedOrderRate: 0.16,
    returnLossPerFailedOrder: 80,
    targetNetProfitPerOrder: 350,
    manualTargetSellPrice: 1990,
  },
  competitors: [],
  salesLog: [],
  scenarioUnitsSold: 0,
  storage: {
    provider: "local",
  },
};

export function roundCurrency(value: number) {
  return Math.round(Number.isFinite(value) ? value : 0);
}

export function normalizeLinks(links: string[]) {
  return links
    .map((link) => link.trim())
    .filter(Boolean);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export const DEFAULT_COMPETITOR_DELIVERY_FEE = 70;

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function countWhere<T>(values: T[], predicate: (value: T) => boolean) {
  return values.reduce((count, value) => count + (predicate(value) ? 1 : 0), 0);
}

export function getAdjustedPrice(competitor: CompetitorEntry) {
  return (
    competitor.listedPrice +
    (competitor.customDeliveryFee && competitor.customDeliveryFee > 0
      ? competitor.customDeliveryFee
      : DEFAULT_COMPETITOR_DELIVERY_FEE)
  );
}

export function computeResearchModel(
  dataset: Pick<ResearchDataset, "product" | "competitors" | "salesLog">,
  scenarioUnitsSold?: number,
) {
  const product = dataset.product;
  const competitors = dataset.competitors.filter((entry) => entry.listedPrice > 0);
  const salesLog = dataset.salesLog;

  const listedPrices = competitors.map((entry) => entry.listedPrice);
  const adjustedPrices = competitors.map((entry) => getAdjustedPrice(entry));
  const averageCompetitorPrice = roundCurrency(average(listedPrices));
  const averageAdjustedCompetitorPrice = roundCurrency(average(adjustedPrices));
  const hasMarketAverage = listedPrices.length > 0 && averageCompetitorPrice > 0;
  const lowestCompetitorPrice =
    listedPrices.length > 0 ? Math.min(...listedPrices) : 0;
  const highestCompetitorPrice =
    listedPrices.length > 0 ? Math.max(...listedPrices) : 0;
  const priceSpread = highestCompetitorPrice - lowestCompetitorPrice;
  const websitePrices = competitors
    .filter((entry) => entry.channel === "Website")
    .map((entry) => entry.listedPrice);
  const facebookPrices = competitors
    .filter((entry) => entry.channel === "Facebook")
    .map((entry) => entry.listedPrice);
  const websiteAveragePrice = roundCurrency(average(websitePrices));
  const facebookAveragePrice = roundCurrency(average(facebookPrices));
  const facebookPremiumOverWeb = facebookAveragePrice - websiteAveragePrice;

  const baseLandedCostPerOrder =
    product.buyingCostPerUnit +
    product.deliveryCostPerOrder +
    product.packagingCostPerOrder +
    product.averageAdCostPerOrder;
  const failedOrderCostSpread =
    product.failedOrderRate *
    (product.returnLossPerFailedOrder +
      product.deliveryCostPerOrder +
      product.packagingCostPerOrder);
  const trueCostPerSuccessfulOrder = baseLandedCostPerOrder + failedOrderCostSpread;
  const breakEvenSellPrice = trueCostPerSuccessfulOrder;
  const recommendedSellPrice =
    trueCostPerSuccessfulOrder + product.targetNetProfitPerOrder;
  const idealBuyingCostAtMarketAverage =
    hasMarketAverage
      ? averageCompetitorPrice -
        product.deliveryCostPerOrder -
        product.packagingCostPerOrder -
        product.averageAdCostPerOrder -
        failedOrderCostSpread -
        product.targetNetProfitPerOrder
      : 0;
  const maxSafeBuyingCost =
    hasMarketAverage
      ? averageCompetitorPrice -
        product.deliveryCostPerOrder -
        product.packagingCostPerOrder -
        product.averageAdCostPerOrder -
        failedOrderCostSpread
      : 0;
  const netProfitAtMarketAveragePrice =
    hasMarketAverage ? averageCompetitorPrice - trueCostPerSuccessfulOrder : 0;
  const marginAtMarketAveragePrice =
    hasMarketAverage
      ? netProfitAtMarketAveragePrice / averageCompetitorPrice
      : 0;
  const headroomToMaxCompetitorPrice = highestCompetitorPrice - recommendedSellPrice;
  const projectedProfitPerOrder = recommendedSellPrice - trueCostPerSuccessfulOrder;
  const projectedTotalProfit = projectedProfitPerOrder * product.unitsBought;
  const totalCapitalInvested = product.buyingCostPerUnit * product.unitsBought;
  const totalAdBudgetNeeded =
    product.averageAdCostPerOrder * product.unitsBought;
  const totalPackagingCostNeeded =
    product.packagingCostPerOrder * product.unitsBought;
  const totalCashNeeded =
    totalCapitalInvested + totalAdBudgetNeeded + totalPackagingCostNeeded;
  const expectedFailedOrders = Math.round(product.unitsBought * product.failedOrderRate);
  const expectedReturnLossReserve =
    expectedFailedOrders *
    (product.returnLossPerFailedOrder +
      product.deliveryCostPerOrder +
      product.packagingCostPerOrder);
  const minRevenueToBreakEven =
    trueCostPerSuccessfulOrder * product.unitsBought;
  const targetRevenueAtRecommendedPrice =
    recommendedSellPrice * product.unitsBought;
  const roiThisBatch =
    totalCapitalInvested > 0 ? projectedTotalProfit / totalCapitalInvested : 0;

  const unitsActuallySold = clamp(
    roundCurrency(scenarioUnitsSold ?? Math.min(16, product.unitsBought)),
    0,
    product.unitsBought,
  );
  const successfulOrders = Math.round(
    unitsActuallySold * (1 - product.failedOrderRate),
  );
  const revenueFromSoldUnits = successfulOrders * recommendedSellPrice;
  const totalCostForSoldUnits = successfulOrders * trueCostPerSuccessfulOrder;
  const netProfitPartial = revenueFromSoldUnits - totalCostForSoldUnits;
  const stillNeedToSell = product.unitsBought - unitsActuallySold;
  const minUnitsToSellToBreakEven =
    recommendedSellPrice > 0
      ? Math.ceil(totalCapitalInvested / recommendedSellPrice)
      : 0;
  const breakEvenRevenueAtUnitTarget =
    minUnitsToSellToBreakEven * recommendedSellPrice;
  const safetyBuffer = lowestCompetitorPrice - breakEvenSellPrice;

  const deliveredOrders = salesLog.filter((entry) => entry.status === "Delivered");
  const returnedOrders = salesLog.filter((entry) => entry.status === "Returned");
  const totalRevenue = deliveredOrders.reduce(
    (sum, entry) => sum + entry.sellPrice,
    0,
  );
  const salesNetProfit = salesLog.reduce((sum, entry) => {
    if (entry.status === "Delivered") {
      return sum + (entry.sellPrice - trueCostPerSuccessfulOrder);
    }

    if (entry.status === "Returned") {
      return (
        sum -
        (product.returnLossPerFailedOrder +
          product.deliveryCostPerOrder +
          product.packagingCostPerOrder)
      );
    }

    return sum;
  }, 0);
  const totalOrdersLogged = salesLog.length;
  const avgProfitPerDeliveredOrder =
    deliveredOrders.length > 0 ? salesNetProfit / deliveredOrders.length : 0;
  const actualFailedRate =
    totalOrdersLogged > 0 ? returnedOrders.length / totalOrdersLogged : 0;
  const unitsRemaining = Math.max(
    product.unitsBought - deliveredOrders.length - returnedOrders.length,
    0,
  );

  const opportunityScore = roundCurrency(
    clamp(
      marginAtMarketAveragePrice * 180 +
        clamp(safetyBuffer, 0, 400) / 10 +
        clamp(headroomToMaxCompetitorPrice, 0, 250) / 10 +
        countWhere(competitors, (entry) => entry.channel === "Facebook") * 4,
      0,
      100,
    ),
  );

  const profitStatus =
    !hasMarketAverage
      ? "Need market data"
      : netProfitAtMarketAveragePrice <= 0
        ? "Loss risk"
        : netProfitAtMarketAveragePrice < 200
          ? "Thin margin"
          : netProfitAtMarketAveragePrice < 350
            ? "Workable margin"
            : "Strong margin";

  const breakEvenAlert =
    !hasMarketAverage
      ? "Need market data"
      : lowestCompetitorPrice < breakEvenSellPrice * 1.05
        ? "Danger: market below safety threshold"
        : "Safe margin";
  const restockDecision =
    !hasMarketAverage
      ? "Need market data"
      : averageCompetitorPrice > breakEvenSellPrice + 200
        ? "Yes, restock"
        : "Wait for a better sourcing or pricing setup";

  const strategyScenarios: StrategyScenario[] = [
    {
      name: "Current plan",
      label: "Recommended sell",
      buyCostPerUnit: product.buyingCostPerUnit,
      sellPrice: recommendedSellPrice,
    },
    {
      name: "Negotiated source",
      label: "Push supplier lower",
      buyCostPerUnit: Math.max(product.buyingCostPerUnit - 90, 0),
      sellPrice: recommendedSellPrice,
    },
    {
      name: "Defend market low",
      label: "Compete on price",
      buyCostPerUnit: product.buyingCostPerUnit,
      sellPrice: lowestCompetitorPrice,
    },
  ];

  const strategyBoard = strategyScenarios.map((scenario) => {
    const scenarioBaseLandedCost =
      scenario.buyCostPerUnit +
      product.deliveryCostPerOrder +
      product.packagingCostPerOrder +
      product.averageAdCostPerOrder;
    const scenarioTrueCost =
      scenarioBaseLandedCost + failedOrderCostSpread;
    const scenarioProfitPerOrder = scenario.sellPrice - scenarioTrueCost;
    const scenarioMargin =
      scenario.sellPrice > 0 ? scenarioProfitPerOrder / scenario.sellPrice : 0;
    const scenarioTotalProfit = scenarioProfitPerOrder * product.unitsBought;

    return {
      ...scenario,
      profitPerOrder: scenarioProfitPerOrder,
      margin: scenarioMargin,
      projectedTotalProfit: scenarioTotalProfit,
      verdict:
        scenarioProfitPerOrder <= 0
          ? "Reject"
          : scenarioProfitPerOrder < 250
            ? "Cautious"
            : "Go",
    };
  });

  return {
    product,
    competitors,
    salesLog,
    competitorSummary: {
      averageCompetitorPrice,
      averageAdjustedCompetitorPrice,
      lowestCompetitorPrice,
      highestCompetitorPrice,
      priceSpread,
      competitorsTracked: competitors.length,
      facebookCompetitors: facebookPrices.length,
      websiteCompetitors: websitePrices.length,
      facebookAveragePrice,
      websiteAveragePrice,
      facebookPremiumOverWeb,
      recommendedVsMarketAverage:
        recommendedSellPrice - averageCompetitorPrice,
    },
    pricing: {
      baseLandedCostPerOrder,
      failedOrderCostSpread,
      trueCostPerSuccessfulOrder,
      breakEvenSellPrice,
      recommendedSellPrice,
      idealBuyingCostAtMarketAverage,
      maxSafeBuyingCost,
      netProfitAtMarketAveragePrice,
      marginAtMarketAveragePrice,
      headroomToMaxCompetitorPrice,
      projectedProfitPerOrder,
      projectedTotalProfit,
      profitStatus,
      opportunityScore,
      breakEvenAlert,
      restockDecision,
      safetyBuffer,
    },
    cashflow: {
      totalCapitalInvested,
      totalAdBudgetNeeded,
      totalPackagingCostNeeded,
      totalCashNeeded,
      expectedFailedOrders,
      expectedReturnLossReserve,
      minRevenueToBreakEven,
      targetRevenueAtRecommendedPrice,
      roiThisBatch,
    },
    scenario: {
      unitsActuallySold,
      successfulOrders,
      revenueFromSoldUnits,
      totalCostForSoldUnits,
      netProfitPartial,
      stillNeedToSell,
      minUnitsToSellToBreakEven,
      breakEvenRevenueAtUnitTarget,
    },
    salesSummary: {
      totalOrdersLogged,
      deliveredOrders: deliveredOrders.length,
      returnedOrders: returnedOrders.length,
      totalRevenue,
      salesNetProfit,
      avgProfitPerDeliveredOrder,
      actualFailedRate,
      unitsRemaining,
    },
    strategyBoard,
  };
}
