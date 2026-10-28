from engine.forgery.api import check_single_document

flags, internal = check_single_document("dataset/applications/app_02/land_deed.pdf", doc_type="land_deed")
print("flags count:", len(flags))
for f in flags:
    print(f)
