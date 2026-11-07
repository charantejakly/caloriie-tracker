"""
Precision vector extractor for anatomical heatmap.
Generates closed SVG path data for every anatomical subdivision
and maps each subdivision to its canonical muscle group.
"""

import cv2
import numpy as np
import json

def extract_front():
    img = cv2.imread('assets/anatomy/front.png', cv2.IMREAD_UNCHANGED)
    gray = cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2GRAY)
    alpha = img[:, :, 3]
    bgr = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

    seeds = {
        'background': [('bg', 0, 0)],
        'base': [
            ('head', 245, 80), ('neck', 245, 160),
            ('hand_l', 55, 520), ('hand_r', 440, 520),
            ('serratus_l1', 175, 315), ('serratus_l2', 175, 350),
            ('serratus_r1', 320, 315), ('serratus_r2', 320, 350),
            ('v_cut', 247, 440),
            ('groin', 247, 525),
            ('knee_l', 185, 680), ('knee_r', 310, 680),
            ('foot_l', 165, 950), ('foot_r', 335, 950)
        ],
        'chest': [
            ('pec_l', 195, 245), ('pec_r', 300, 245),
            ('pec_u_l', 180, 215), ('pec_u_r', 315, 215)
        ],
        'anterior_deltoids': [
            ('ant_delt_l', 135, 215), ('ant_delt_r', 360, 215)
        ],
        'lateral_deltoids': [
            ('lat_delt_l', 105, 225), ('lat_delt_r', 390, 225)
        ],
        'biceps': [
            ('bicep_l', 125, 305), ('bicep_r', 370, 305)
        ],
        'forearms': [
            ('forearm_l1', 85, 410), ('forearm_l2', 105, 410), ('forearm_l3', 68, 440),
            ('forearm_r1', 415, 410), ('forearm_r2', 390, 410), ('forearm_r3', 430, 440)
        ],
        'abs': [
            ('abs_u_l', 218, 312), ('abs_u_r', 268, 312),
            ('abs_m_l', 218, 348), ('abs_m_r', 268, 348),
            ('abs_l_l', 218, 384), ('abs_l_r', 268, 384)
        ],
        'obliques': [
            ('obl_l_l', 175, 400), ('obl_f_l', 160, 480),
            ('obl_l_r', 320, 400), ('obl_f_r', 335, 480)
        ],
        'quadriceps': [
            ('quad_c_l', 195, 560), ('quad_o_l', 160, 560), ('quad_i_l', 220, 630),
            ('quad_c_r', 300, 560), ('quad_o_r', 335, 560), ('quad_i_r', 275, 630)
        ],
        'calves': [
            ('calf_l1', 165, 780), ('calf_l2', 195, 800),
            ('calf_r1', 330, 780), ('calf_r2', 300, 800)
        ]
    }

    markers = np.zeros((1024, 499), dtype=np.int32)
    markers[alpha < 50] = 1

    marker_map = {}
    m_id = 2
    for group, pts in seeds.items():
        if group == 'background': continue
        for name, x, y in pts:
            cv2.circle(markers, (x, y), 5, m_id, -1)
            marker_map[m_id] = (group, name)
            m_id += 1

    cv2.watershed(bgr, markers)

    # Extract contours per individual marker region so anatomical divisions are preserved
    results = {}
    for mid, (group, name) in marker_map.items():
        if group == 'base': continue
        m = (markers == mid).astype(np.uint8)
        if np.sum(m) < 150:
            continue
        contours, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for c in contours:
            if cv2.contourArea(c) < 150:
                continue
            approx = cv2.approxPolyDP(c, 2.0, True)
            pts = approx.reshape(-1, 2)
            d = 'M ' + ' L '.join(f'{p[0]},{p[1]}' for p in pts) + ' Z'
            if group not in results:
                results[group] = []
            results[group].append({'name': name, 'd': d})

    return results

def extract_back():
    img = cv2.imread('assets/anatomy/back.png', cv2.IMREAD_UNCHANGED)
    gray = cv2.cvtColor(img[:, :, :3], cv2.COLOR_BGR2GRAY)
    alpha = img[:, :, 3]
    bgr = cv2.cvtColor(gray, cv2.COLOR_GRAY2BGR)

    seeds = {
        'background': [('bg', 0, 0)],
        'base': [
            ('head', 236, 80),
            ('elbow_l', 110, 350), ('elbow_r', 360, 350),
            ('hand_l', 50, 520), ('hand_r', 420, 520),
            ('knee_back_l', 170, 725), ('knee_back_r', 300, 725),
            ('foot_l', 160, 960), ('foot_r', 310, 960)
        ],
        'traps': [
            ('traps_neck', 236, 140),
            ('traps_mid_l', 215, 210), ('traps_mid_r', 255, 210),
            ('traps_low', 236, 280)
        ],
        'posterior_deltoids': [
            ('post_delt_l', 125, 225), ('post_delt_r', 345, 225)
        ],
        'lateral_deltoids': [
            ('lat_delt_l', 95, 230), ('lat_delt_r', 375, 230)
        ],
        'triceps': [
            ('tri_long_l', 125, 295), ('tri_lat_l', 105, 305),
            ('tri_long_r', 345, 295), ('tri_lat_r', 365, 305)
        ],
        'lats': [
            ('lat_l1', 180, 310), ('lat_l2', 170, 370),
            ('lat_r1', 290, 310), ('lat_r2', 300, 370)
        ],
        'lower_back': [
            ('low_back_mid', 236, 400), ('low_back_l', 225, 435), ('low_back_r', 245, 435)
        ],
        'forearms': [
            ('forearm_l1', 80, 420), ('forearm_l2', 95, 440), ('forearm_l3', 65, 460),
            ('forearm_r1', 390, 420), ('forearm_r2', 375, 440), ('forearm_r3', 405, 460)
        ],
        'glutes': [
            ('glute_l1', 190, 470), ('glute_l2', 175, 500),
            ('glute_r1', 280, 470), ('glute_r2', 295, 500)
        ],
        'hamstrings': [
            ('ham_l1', 165, 590), ('ham_l2', 195, 620), ('ham_l3', 150, 640),
            ('ham_r1', 305, 590), ('ham_r2', 275, 620), ('ham_r3', 320, 640)
        ],
        'calves': [
            ('calf_l1', 150, 780), ('calf_l2', 185, 780), ('calf_l3', 170, 840),
            ('calf_r1', 320, 780), ('calf_r2', 285, 780), ('calf_r3', 300, 840)
        ]
    }

    markers = np.zeros((1024, 472), dtype=np.int32)
    markers[alpha < 50] = 1

    marker_map = {}
    m_id = 2
    for group, pts in seeds.items():
        if group == 'background': continue
        for name, x, y in pts:
            cv2.circle(markers, (x, y), 5, m_id, -1)
            marker_map[m_id] = (group, name)
            m_id += 1

    cv2.watershed(bgr, markers)

    X_OFFSET = 14
    results = {}
    for mid, (group, name) in marker_map.items():
        if group == 'base': continue
        m = (markers == mid).astype(np.uint8)
        if np.sum(m) < 150:
            continue
        contours, _ = cv2.findContours(m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for c in contours:
            if cv2.contourArea(c) < 150:
                continue
            approx = cv2.approxPolyDP(c, 2.0, True)
            pts = approx.reshape(-1, 2)
            d = 'M ' + ' L '.join(f'{p[0] + X_OFFSET},{p[1]}' for p in pts) + ' Z'
            if group not in results:
                results[group] = []
            results[group].append({'name': name, 'd': d})

    return results

if __name__ == '__main__':
    f_res = extract_front()
    b_res = extract_back()
    
    with open('scripts/front_subdivisions.json', 'w') as f:
        json.dump(f_res, f, indent=2)
    with open('scripts/back_subdivisions.json', 'w') as f:
        json.dump(b_res, f, indent=2)
        
    print('Front subdivision counts:')
    for g, items in f_res.items():
        print(f'  {g}: {len(items)} subdivision(s)')
    print('Back subdivision counts:')
    for g, items in b_res.items():
        print(f'  {g}: {len(items)} subdivision(s)')
