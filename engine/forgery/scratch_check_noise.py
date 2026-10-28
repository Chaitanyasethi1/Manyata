from engine.forgery.scratch_test_patch3 import tam_arr, unt_arr
from engine.forgery.textfeatures import analyze_noise_consistency, analyze_font_consistency

u_noise = analyze_noise_consistency(unt_arr)
t_noise = analyze_noise_consistency(tam_arr)

print("Untouched noise:", len(u_noise))
print("Tampered noise:", len(t_noise))
for r in t_noise:
    print("  noise flag:", r["bbox_native"], r["score"], r["message"])
