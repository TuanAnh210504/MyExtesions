"""
Gesture Meme Activator - v3
Gestures & Files:
  neutral.jpg           -> Trang thai binh thuong
  meme-meo-bua-...jpg   -> cover_mouth   (tay che mieng)
  OIP (2).jpg           -> index_up      (ngon tro chi len)
  OIP (3).jpg           -> double_fist   (2 nam dam chap)
  OIP (4).jpg           -> fist_pump     (1 nam dam giang)
  OIP.jpg               -> smile         (cuoi nhe rang)
  liec.jpg              -> face_tilt     (mat xeo = liec)
  OIP (5).jpg           -> finger_cheek  (ngon tro chi vao ma)
  OIP (6).jpg           -> point_smile   (chi vao cam + mieng cuoi)
  OIP (7).jpg           -> open_mouth    (ha mieng)
  OIP (8).jpg           -> hands_on_head (2 tay om dau)
"""

import cv2
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
from mediapipe.tasks.python.vision import RunningMode
import os, sys, urllib.request
import numpy as np

# -------------------------------------------------------
# Config
# -------------------------------------------------------
ASSETS_DIR = "assets"

FILE_GESTURE_MAP = {
    "neutral.jpg":                  "neutral",
    "meme-meo-bua-yody-vn-66.jpg":  "cover_mouth",
    "OIP (2).jpg":                   "index_up",
    "OIP (3).jpg":                   "double_fist",
    "OIP (4).jpg":                   "fist_pump",
    "OIP.jpg":                       "smile",
    "liec.jpg":                      "face_tilt",
    "OIP (5).jpg":                   "finger_cheek",
    "OIP (6).jpg":                   "point_smile",
    "OIP (7).jpg":                   "open_mouth",
    "OIP (8).jpg":                   "hands_on_head",
}

# Priority: higher = checked first
GESTURE_PRIORITY = [
    "cover_mouth",
    "hands_on_head",
    "double_fist",
    "point_smile",
    "finger_cheek",
    "fist_pump",
    "index_up",
    "open_mouth",
    "smile",
    "face_tilt",
    "neutral",
]

GESTURE_COLORS = {
    "cover_mouth":  (0,   165, 255),
    "hands_on_head":(255, 0,   0),
    "double_fist":  (0,   0,   255),
    "point_smile":  (0,   255, 255),
    "finger_cheek": (180, 0,   255),
    "fist_pump":    (255, 0,   200),
    "index_up":     (0,   200, 255),
    "open_mouth":   (255, 128, 0),
    "smile":        (0,   220, 0),
    "face_tilt":    (200, 200, 0),
    "neutral":      (180, 180, 180),
}

MODEL_DIR = r"C:\meme_models"
FACE_MODEL_PATH = os.path.join(MODEL_DIR, "face_landmarker.task")
HAND_MODEL_PATH = os.path.join(MODEL_DIR, "hand_landmarker.task")
FACE_MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task"
HAND_MODEL_URL  = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"

HAND_CONNECTIONS = [
    (0,1),(1,2),(2,3),(3,4),(0,5),(5,6),(6,7),(7,8),
    (0,9),(9,10),(10,11),(11,12),(0,13),(13,14),(14,15),(15,16),
    (0,17),(17,18),(18,19),(19,20),(5,9),(9,13),(13,17),
]

# -------------------------------------------------------
# Helpers
# -------------------------------------------------------
def download_model(url, path):
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        print(f"[Download] {os.path.basename(path)} ...")
        urllib.request.urlretrieve(url, path)

def load_memes():
    fallback = np.zeros((480, 480, 3), dtype=np.uint8)
    memes = {}
    print("\n[Assets] Loading...")
    for fname, gesture in FILE_GESTURE_MAP.items():
        path = os.path.join(ASSETS_DIR, fname)
        img = cv2.imread(path) if os.path.exists(path) else None
        memes[gesture] = img if img is not None else fallback.copy()
        status = "OK" if img is not None else "MISSING -> black"
        print(f"  [{status}] {fname} -> {gesture}")
    return memes

def dist2d(a, b):
    return ((a.x - b.x)**2 + (a.y - b.y)**2) ** 0.5

# -------------------------------------------------------
# Hand shape helpers
# -------------------------------------------------------
def is_fist(h):
    """Nam dam: 2 phuong phap OR."""
    TRIPLETS = [(8,6,5),(12,10,9),(16,14,13),(20,18,17)]
    # Method 1: y-curl
    if sum(1 for t,p,m in TRIPLETS if h[t].y > h[p].y) >= 3:
        return True
    # Method 2: fingertip clustering near palm
    ref = dist2d(h[0], h[9])
    if ref < 0.01:
        return False
    return sum(1 for i in [8,12,16,20] if dist2d(h[i], h[9]) <= ref * 1.15) >= 3

def is_index_up(h):
    """Chi ngon tro, 3 ngon con gap chat."""
    up = h[8].y < h[6].y and h[8].y < h[5].y
    m  = h[12].y > h[10].y and h[12].y > h[9].y
    r  = h[16].y > h[14].y and h[16].y > h[13].y
    p  = h[20].y > h[18].y and h[20].y > h[17].y
    return up and m and r and p

# -------------------------------------------------------
# Gesture detection
# -------------------------------------------------------
def detect_gesture(face_res, hand_res):
    f = face_res.face_landmarks[0] if face_res.face_landmarks else None
    hands = hand_res.hand_landmarks

    # --- COVER_MOUTH: >= 2 fingertips sat vung mieng, co tay o duoi mieng ---
    if f and hands:
        my = (f[13].y + f[14].y) / 2
        mx = (f[13].x + f[14].x) / 2
        for h in hands:
            if h[0].y < my * 0.85:  # co tay phai o duoi mieng
                continue
            near = sum(1 for i in [8,12,16,20]
                       if abs(h[i].y - my) < 0.09 and abs(h[i].x - mx) < 0.22)
            if near >= 2:
                return "cover_mouth"

    # --- HANDS_ON_HEAD: 2 tay o 2 ben dau ---
    if f and len(hands) >= 2:
        fc_x = (f[234].x + f[454].x) / 2
        eye_y = (f[33].y + f[263].y) / 2
        left  = any(h[9].x < fc_x and abs(h[9].y - eye_y) < 0.22 for h in hands)
        right = any(h[9].x > fc_x and abs(h[9].y - eye_y) < 0.22 for h in hands)
        if left and right:
            return "hands_on_head"

    # --- DOUBLE_FIST: 2 nam dam gan nhau ---
    if len(hands) >= 2 and all(is_fist(h) for h in hands):
        d = dist2d(hands[0][9], hands[1][9])
        if d < 0.22:
            return "double_fist"

    # --- POINT_SMILE: ngon tro len + mieng cuoi/mo ---
    if f and hands:
        mouth_open = (f[14].y - f[13].y) > 0.035
        if mouth_open and any(is_index_up(h) for h in hands):
            return "point_smile"

    # --- FINGER_CHEEK: ngon tro sat ma ---
    if f and hands:
        lc_x, rc_x = f[234].x, f[454].x
        cheek_y = (f[33].y + f[152].y) / 2
        for h in hands:
            if is_index_up(h):
                tx, ty = h[8].x, h[8].y
                near = (abs(ty - cheek_y) < 0.14 and
                        (abs(tx - lc_x) < 0.12 or abs(tx - rc_x) < 0.12))
                if near:
                    return "finger_cheek"

    # --- FIST_PUMP: 1 nam dam giang len ---
    if hands:
        for h in hands:
            if is_fist(h) and h[9].y < 0.60:
                return "fist_pump"

    # --- INDEX_UP: ngon tro chi len ---
    if hands and any(is_index_up(h) for h in hands):
        return "index_up"

    # --- OPEN_MOUTH: ha mieng doc ---
    if f:
        face_h = max(f[152].y - f[10].y, 0.01)
        if (f[14].y - f[13].y) / face_h > 0.11:
            return "open_mouth"

    # --- SMILE: mieng rong ---
    if f:
        mw = abs(f[291].x - f[61].x)
        ew = abs(f[263].x - f[33].x)
        if ew > 0 and mw / ew > 0.72:
            return "smile"

    # --- FACE_TILT: mat xeo (liec) ---
    if f:
        nose_x = f[1].x
        fc_x   = (f[234].x + f[454].x) / 2
        fw     = abs(f[454].x - f[234].x)
        if fw > 0 and abs(nose_x - fc_x) / fw > 0.14:
            return "face_tilt"

    return "neutral"

# -------------------------------------------------------
# Draw helpers
# -------------------------------------------------------
def draw_landmarks(frame, face_res, hand_res):
    h, w = frame.shape[:2]
    if face_res.face_landmarks:
        face = face_res.face_landmarks[0]
        for idx in [33, 263, 61, 291, 13, 14, 10, 234, 454, 1, 152]:
            cx, cy = int(face[idx].x * w), int(face[idx].y * h)
            cv2.circle(frame, (cx, cy), 3, (180, 255, 180), -1)
    for hl in hand_res.hand_landmarks:
        for a, b in HAND_CONNECTIONS:
            cv2.line(frame,
                     (int(hl[a].x*w), int(hl[a].y*h)),
                     (int(hl[b].x*w), int(hl[b].y*h)),
                     (0, 200, 255), 2)
        for lm in hl:
            cv2.circle(frame, (int(lm.x*w), int(lm.y*h)), 4, (255, 255, 0), -1)

# -------------------------------------------------------
# Main
# -------------------------------------------------------
def main():
    print("=" * 50)
    print("  GESTURE MEME ACTIVATOR v3")
    print("=" * 50)

    memes = load_memes()
    print("\n[Model] Checking...")
    download_model(FACE_MODEL_URL, FACE_MODEL_PATH)
    download_model(HAND_MODEL_URL,  HAND_MODEL_PATH)

    face_det = mp_vision.FaceLandmarker.create_from_options(
        mp_vision.FaceLandmarkerOptions(
            base_options=mp_python.BaseOptions(model_asset_path=FACE_MODEL_PATH),
            running_mode=RunningMode.VIDEO, num_faces=1,
            min_face_detection_confidence=0.5, min_face_presence_confidence=0.5,
        ))
    hand_det = mp_vision.HandLandmarker.create_from_options(
        mp_vision.HandLandmarkerOptions(
            base_options=mp_python.BaseOptions(model_asset_path=HAND_MODEL_PATH),
            running_mode=RunningMode.VIDEO, num_hands=2,
            min_hand_detection_confidence=0.5, min_hand_presence_confidence=0.5,
        ))

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("[Error] Cannot open webcam!")
        sys.exit(1)

    cv2.namedWindow("Camera", cv2.WINDOW_NORMAL)
    cv2.namedWindow("Meme",   cv2.WINDOW_NORMAL)

    print("\n[Running] Gestures:")
    print("  Tay che mieng -> cover_mouth")
    print("  2 tay om dau  -> hands_on_head")
    print("  2 nam dam chap -> double_fist")
    print("  Chi vao cam+cuoi -> point_smile")
    print("  Ngon tro vao ma -> finger_cheek")
    print("  1 nam dam giang -> fist_pump")
    print("  Ngon tro len   -> index_up")
    print("  Ha mieng       -> open_mouth")
    print("  Cuoi nhe rang  -> smile")
    print("  Mat xeo        -> face_tilt  [can file liec.jpg]")
    print("  Press q/ESC to quit\n")

    prev_gesture = None
    current_meme = memes.get("neutral")
    ts = 0

    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            frame = cv2.flip(frame, 1)
            ts += 33

            mp_img = mp.Image(
                image_format=mp.ImageFormat.SRGB,
                data=cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

            face_res = face_det.detect_for_video(mp_img, ts)
            hand_res  = hand_det.detect_for_video(mp_img, ts)

            draw_landmarks(frame, face_res, hand_res)

            gesture = detect_gesture(face_res, hand_res)
            if gesture != prev_gesture:
                current_meme = memes.get(gesture, memes.get("neutral"))
                prev_gesture = gesture

            color = GESTURE_COLORS.get(gesture, (255, 255, 255))
            cv2.putText(frame, gesture.upper().replace("_", " "),
                        (10, 48), cv2.FONT_HERSHEY_SIMPLEX, 1.2, color, 3, cv2.LINE_AA)

            cv2.imshow("Camera", frame)
            cv2.imshow("Meme",   current_meme)

            if cv2.waitKey(5) & 0xFF in (27, ord('q')):
                break

    except Exception as e:
        print(f"[Error] {e}")
        import traceback; traceback.print_exc()
    finally:
        cap.release()
        face_det.close()
        hand_det.close()
        cv2.destroyAllWindows()
        print("[Done]")

if __name__ == "__main__":
    main()
