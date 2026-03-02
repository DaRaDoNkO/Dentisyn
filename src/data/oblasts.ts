/**
 * Bulgarian oblasts (области) and health regions (здравни райони)
 * Used for RZOK and health region dropdowns in patient registration
 */

export interface OblastInfo {
  code: string;
  nameBG: string;
  nameEN: string;
}

export const OBLASTS: OblastInfo[] = [
  { code: 'BLG', nameBG: 'Благоевград', nameEN: 'Blagoevgrad' },
  { code: 'BGS', nameBG: 'Бургас', nameEN: 'Burgas' },
  { code: 'VAR', nameBG: 'Варна', nameEN: 'Varna' },
  { code: 'VTR', nameBG: 'Велико Търново', nameEN: 'Veliko Tarnovo' },
  { code: 'VID', nameBG: 'Видин', nameEN: 'Vidin' },
  { code: 'VRC', nameBG: 'Враца', nameEN: 'Vratsa' },
  { code: 'GAB', nameBG: 'Габрово', nameEN: 'Gabrovo' },
  { code: 'DOB', nameBG: 'Добрич', nameEN: 'Dobrich' },
  { code: 'KRZ', nameBG: 'Кърджали', nameEN: 'Kardzhali' },
  { code: 'KNL', nameBG: 'Кюстендил', nameEN: 'Kyustendil' },
  { code: 'LOV', nameBG: 'Ловеч', nameEN: 'Lovech' },
  { code: 'MON', nameBG: 'Монтана', nameEN: 'Montana' },
  { code: 'PAZ', nameBG: 'Пазарджик', nameEN: 'Pazardzhik' },
  { code: 'PER', nameBG: 'Перник', nameEN: 'Pernik' },
  { code: 'PVN', nameBG: 'Плевен', nameEN: 'Pleven' },
  { code: 'PDV', nameBG: 'Пловдив', nameEN: 'Plovdiv' },
  { code: 'RAZ', nameBG: 'Разград', nameEN: 'Razgrad' },
  { code: 'RSE', nameBG: 'Русе', nameEN: 'Ruse' },
  { code: 'SLS', nameBG: 'Силистра', nameEN: 'Silistra' },
  { code: 'SLV', nameBG: 'Сливен', nameEN: 'Sliven' },
  { code: 'SML', nameBG: 'Смолян', nameEN: 'Smolyan' },
  { code: 'SFO', nameBG: 'София-област', nameEN: 'Sofia Province' },
  { code: 'SOF', nameBG: 'София-град', nameEN: 'Sofia City' },
  { code: 'SZR', nameBG: 'Стара Загора', nameEN: 'Stara Zagora' },
  { code: 'TGV', nameBG: 'Търговище', nameEN: 'Targovishte' },
  { code: 'HKV', nameBG: 'Хасково', nameEN: 'Haskovo' },
  { code: 'SHU', nameBG: 'Шумен', nameEN: 'Shumen' },
  { code: 'JAM', nameBG: 'Ямбол', nameEN: 'Yambol' },
];

export interface HealthRegionInfo {
  code: string;
  nameBG: string;
  nameEN: string;
}

export const HEALTH_REGIONS: HealthRegionInfo[] = [
  { code: 'HR01', nameBG: 'Благоевград', nameEN: 'Blagoevgrad' },
  { code: 'HR02', nameBG: 'Бургас', nameEN: 'Burgas' },
  { code: 'HR03', nameBG: 'Варна', nameEN: 'Varna' },
  { code: 'HR04', nameBG: 'Велико Търново', nameEN: 'Veliko Tarnovo' },
  { code: 'HR05', nameBG: 'Видин', nameEN: 'Vidin' },
  { code: 'HR06', nameBG: 'Враца', nameEN: 'Vratsa' },
  { code: 'HR07', nameBG: 'Габрово', nameEN: 'Gabrovo' },
  { code: 'HR08', nameBG: 'Добрич', nameEN: 'Dobrich' },
  { code: 'HR09', nameBG: 'Кърджали', nameEN: 'Kardzhali' },
  { code: 'HR10', nameBG: 'Кюстендил', nameEN: 'Kyustendil' },
  { code: 'HR11', nameBG: 'Ловеч', nameEN: 'Lovech' },
  { code: 'HR12', nameBG: 'Монтана', nameEN: 'Montana' },
  { code: 'HR13', nameBG: 'Пазарджик', nameEN: 'Pazardzhik' },
  { code: 'HR14', nameBG: 'Перник', nameEN: 'Pernik' },
  { code: 'HR15', nameBG: 'Плевен', nameEN: 'Pleven' },
  { code: 'HR16', nameBG: 'Пловдив', nameEN: 'Plovdiv' },
  { code: 'HR17', nameBG: 'Разград', nameEN: 'Razgrad' },
  { code: 'HR18', nameBG: 'Русе', nameEN: 'Ruse' },
  { code: 'HR19', nameBG: 'Силистра', nameEN: 'Silistra' },
  { code: 'HR20', nameBG: 'Сливен', nameEN: 'Sliven' },
  { code: 'HR21', nameBG: 'Смолян', nameEN: 'Smolyan' },
  { code: 'HR22', nameBG: 'София-област', nameEN: 'Sofia Province' },
  { code: 'HR23', nameBG: 'София-град', nameEN: 'Sofia City' },
  { code: 'HR24', nameBG: 'Стара Загора', nameEN: 'Stara Zagora' },
  { code: 'HR25', nameBG: 'Търговище', nameEN: 'Targovishte' },
  { code: 'HR26', nameBG: 'Хасково', nameEN: 'Haskovo' },
  { code: 'HR27', nameBG: 'Шумен', nameEN: 'Shumen' },
  { code: 'HR28', nameBG: 'Ямбол', nameEN: 'Yambol' },
];
