// 本文件由 engine/standards.toml 自动生成，请勿手改。
// 重新生成：cd engine && python scripts/export_standards.py
module.exports = {
  "meta": {
    "schema_version": "0.1.0",
    "source": "sJIA合并MAS动态预警平台_产品需求书_V1.0",
    "source_date": "2026-10-01",
    "compiled_at": "2026-10-08"
  },
  "indicators": {
    "ferritin": {
      "label": "铁蛋白（SF）",
      "unit": "ng/mL",
      "group": "核心指标"
    },
    "platelet": {
      "label": "血小板计数",
      "unit": "10^9/L",
      "group": "核心指标"
    },
    "ast": {
      "label": "天门冬氨酸氨基转移酶（AST）",
      "unit": "U/L",
      "group": "核心指标"
    },
    "ldh": {
      "label": "乳酸脱氢酶（LDH）",
      "unit": "U/L",
      "group": "核心指标"
    },
    "fibrinogen": {
      "label": "纤维蛋白原",
      "unit": "mg/dL",
      "group": "核心指标"
    },
    "triglyceride": {
      "label": "甘油三酯",
      "unit": "mg/dL",
      "group": "核心指标"
    },
    "hemoglobin": {
      "label": "血红蛋白",
      "unit": "g/L",
      "group": "血常规"
    },
    "wbc": {
      "label": "白细胞计数",
      "unit": "10^9/L",
      "group": "血常规"
    },
    "neutrophil": {
      "label": "中性粒细胞绝对值",
      "unit": "10^9/L",
      "group": "血常规"
    },
    "esr": {
      "label": "红细胞沉降率（ESR）",
      "unit": "mm/h",
      "group": "血常规"
    },
    "alt": {
      "label": "丙氨酸氨基转移酶（ALT）",
      "unit": "U/L",
      "group": "肝功与凝血（只记录，不告警）"
    },
    "bilirubin": {
      "label": "总胆红素",
      "unit": "umol/L",
      "group": "肝功与凝血（只记录，不告警）"
    },
    "pt": {
      "label": "凝血酶原时间（PT）",
      "unit": "s",
      "group": "肝功与凝血（只记录，不告警）"
    },
    "aptt": {
      "label": "活化部分凝血活酶时间（APTT）",
      "unit": "s",
      "group": "肝功与凝血（只记录，不告警）"
    },
    "d_dimer": {
      "label": "D-二聚体",
      "unit": "mg/L FEU",
      "group": "肝功与凝血（只记录，不告警）"
    },
    "cd163": {
      "label": "sCD163",
      "unit": "ng/mL",
      "group": "研究性（只记录，不告警）"
    },
    "crp": {
      "label": "C 反应蛋白",
      "unit": "mg/L",
      "group": "研究性（只记录，不告警）"
    }
  },
  "reference_directions": {
    "note": "sJIA / MAS / HLH 三列的方向，用于人工核对，不参与任何自动判定",
    "wbc": {
      "sjia": "升",
      "mas": "降低或下降趋势",
      "hlh": "降低"
    },
    "hemoglobin": {
      "sjia": "正常或降低",
      "mas": "降低或下降趋势",
      "hlh": "降低"
    },
    "platelet": {
      "sjia": "升高",
      "mas": "降低或下降趋势",
      "hlh": "降低"
    },
    "esr": {
      "sjia": "升高",
      "mas": "正常或突然下降",
      "hlh": "通常较低"
    },
    "bilirubin": {
      "sjia": "正常",
      "mas": "正常或升高",
      "hlh": "正常或升高"
    },
    "alt": {
      "sjia": "正常或升高",
      "mas": "升高",
      "hlh": "升高"
    },
    "ast": {
      "sjia": "正常或升高",
      "mas": "升高",
      "hlh": "升高"
    },
    "pt": {
      "sjia": "正常",
      "mas": "升高",
      "hlh": "升高"
    },
    "aptt": {
      "sjia": "正常",
      "mas": "升高",
      "hlh": "升高"
    },
    "d_dimer": {
      "sjia": "升高",
      "mas": "升高",
      "hlh": "升高"
    },
    "fibrinogen": {
      "sjia": "升高",
      "mas": "降低",
      "hlh": "降低"
    },
    "ferritin": {
      "sjia": "正常或升高",
      "mas": "升高",
      "hlh": "升高"
    }
  },
  "printo_2016": {
    "id": "printo_2016",
    "name": "2016 PRINTO/ACR/EULAR MAS 分类标准",
    "requires_suspected_sjia": true,
    "requires_fever": true,
    "fever_min_temp_c": 38.0,
    "mandatory": {
      "indicator": "ferritin",
      "op": ">",
      "value": 684.0,
      "unit": "ng/mL",
      "text": "铁蛋白 > 684 ng/mL"
    },
    "min_additional": 2,
    "additional": [
      {
        "indicator": "platelet",
        "op": "<",
        "value": 181.0,
        "unit": "10^9/L",
        "text": "血小板 < 181×10⁹/L"
      },
      {
        "indicator": "ast",
        "op": ">",
        "value": 48.0,
        "unit": "U/L",
        "text": "AST > 48 U/L"
      },
      {
        "indicator": "triglyceride",
        "op": ">",
        "value": 156.0,
        "unit": "mg/dL",
        "text": "甘油三酯 > 156 mg/dL"
      },
      {
        "indicator": "fibrinogen",
        "op": "<",
        "value": 360.0,
        "unit": "mg/dL",
        "text": "纤维蛋白原降低（< 360 mg/dL，即 3.6 g/L）"
      }
    ]
  },
  "hlh_2004": {
    "id": "hlh_2004",
    "name": "HLH 诊断标准（2004）",
    "min_hits": 5,
    "criteria": [
      {
        "id": "nk_activity",
        "text": "NK 细胞活性降低",
        "available": false,
        "reason": "需要特殊检查"
      },
      {
        "id": "scd25",
        "text": "sCD25（可溶性 IL-2 受体）升高",
        "available": false,
        "reason": "需要特殊检查"
      },
      {
        "id": "hemophagocytosis",
        "text": "骨髓、肝脾或淋巴结中检出噬血现象",
        "available": false,
        "reason": "需要病理检查"
      },
      {
        "id": "fever",
        "text": "发热 > 38.5℃ 且持续 > 1 周",
        "available": true,
        "rule": "fever_over_week",
        "min_temp_c": 38.5,
        "min_days": 7
      },
      {
        "id": "splenomegaly",
        "text": "脾大",
        "available": true,
        "rule": "flag",
        "flag": "splenomegaly"
      },
      {
        "id": "cytopenia",
        "text": "血细胞减少（累及外周血两系或三系）",
        "available": true,
        "rule": "cytopenia",
        "min_lineages": 2,
        "lineages": [
          {
            "indicator": "hemoglobin",
            "op": "<",
            "value": 90.0
          },
          {
            "indicator": "platelet",
            "op": "<",
            "value": 100.0
          },
          {
            "indicator": "neutrophil",
            "op": "<",
            "value": 1.0
          }
        ]
      },
      {
        "id": "tg_or_fbg",
        "text": "甘油三酯 > 3 mmol/L 或纤维蛋白原 < 1.5 g/L",
        "available": true,
        "rule": "any_of",
        "conditions": [
          {
            "indicator": "triglyceride",
            "op": ">",
            "value": 265.7
          },
          {
            "indicator": "fibrinogen",
            "op": "<",
            "value": 150.0
          }
        ]
      },
      {
        "id": "ferritin",
        "text": "铁蛋白 > 500 µg/L",
        "available": true,
        "rule": "threshold",
        "indicator": "ferritin",
        "op": ">",
        "value": 500.0
      }
    ]
  },
  "ms_score": {
    "id": "ms_score",
    "name": "MS 评分表（MAS/sJIA）",
    "threshold_op": ">=",
    "threshold": -2.1,
    "intercept": 0.0,
    "note": "发热是病情活动的强制指标，因此不进公式",
    "terms": [
      {
        "key": "cns_involvement",
        "kind": "flag",
        "coefficient": 2.44,
        "text": "中枢神经系统受累"
      },
      {
        "key": "bleeding",
        "kind": "flag",
        "coefficient": 1.54,
        "text": "出血现象"
      },
      {
        "key": "arthritis",
        "kind": "flag",
        "coefficient": -1.3,
        "text": "关节炎"
      },
      {
        "key": "platelet",
        "kind": "indicator",
        "coefficient": -0.003,
        "unit": "10^9/L",
        "text": "血小板计数"
      },
      {
        "key": "ldh",
        "kind": "indicator",
        "coefficient": 0.001,
        "unit": "U/L",
        "text": "乳酸脱氢酶（LDH）"
      },
      {
        "key": "fibrinogen",
        "kind": "indicator",
        "coefficient": -0.004,
        "unit": "mg/dL",
        "text": "纤维蛋白原"
      },
      {
        "key": "ferritin",
        "kind": "indicator",
        "coefficient": 0.0001,
        "unit": "ng/mL",
        "text": "铁蛋白"
      }
    ]
  },
  "trend_rules": [
    {
      "indicator": "ferritin",
      "direction": "up",
      "watch_pct": 50.0,
      "strong_pct": 100.0,
      "strong_doubling_hours": 48.0,
      "rationale": "需求书 §4.5 列入动态监测；技术管线草稿指出「48 小时翻倍是强信号」"
    },
    {
      "indicator": "platelet",
      "direction": "down",
      "watch_pct": 15.0,
      "strong_pct": 30.0,
      "rationale": "需求书 §2.1 附加条目、§4.5「血细胞计数异常降低」"
    },
    {
      "indicator": "fibrinogen",
      "direction": "down",
      "watch_pct": 15.0,
      "strong_pct": 30.0,
      "rationale": "需求书 §4.5「血管内凝血激活、纤维蛋白原」"
    },
    {
      "indicator": "ast",
      "direction": "up",
      "watch_pct": 50.0,
      "strong_pct": 100.0,
      "rationale": "需求书 §4.5「肝功能异常」"
    },
    {
      "indicator": "triglyceride",
      "direction": "up",
      "watch_pct": 50.0,
      "strong_pct": 100.0,
      "rationale": "需求书 §4.5「血清甘油三酯升高或上升」"
    },
    {
      "indicator": "ldh",
      "direction": "up",
      "watch_pct": 50.0,
      "strong_pct": 100.0,
      "rationale": "需求书 §4.5「乳酸脱氢酶（LDH）」"
    }
  ],
  "research_signals": {
    "enabled": true,
    "note": "以下两项来自技术管线草稿，不属于需求书官方标准，只作参考展示，不参与判定",
    "ferritin_esr_ratio_min": 99.4,
    "esr_decline_max": 20.0
  },
  "tiering": {
    "dynamic_red_strong_alerts": 2,
    "dynamic_yellow_strong_alerts": 1,
    "dynamic_yellow_watch_alerts": 2,
    "dynamic_red_indicators": [
      "ferritin"
    ],
    "ms_score_triggers_red": false,
    "note": "需求书未规定汇总规则，本节的数值为本项目默认参数，未经临床评审"
  }
};
