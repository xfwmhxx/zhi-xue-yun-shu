export const BASE_DRINKS: Record<string, string[]> = {
  偏寒: ["姜片", "红枣", "桂圆"],
  偏热: ["菊花", "薄荷", "桑叶"],
  气虚: ["黄芪", "党参", "红枣"],
  血虚: ["桂圆", "枸杞", "红枣"],
  湿热: ["薏米", "茯苓", "金银花"],
  平和: ["枸杞", "菊花", "红枣"]
};

export function getDrinks(constitution: string | null | undefined) {
  if (!constitution) return undefined;
  return BASE_DRINKS[constitution];
}

