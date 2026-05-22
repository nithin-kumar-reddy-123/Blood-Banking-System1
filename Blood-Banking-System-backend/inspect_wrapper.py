import zipfile
p = r'C:\Users\pc\Documents\Projects\Blood-Banking-System\Blood-Banking-System-backend\.mvn\wrapper\maven-wrapper.jar'
with zipfile.ZipFile(p, 'r') as z:
    for i, entry in enumerate(z.namelist()):
        print(entry)
        if i >= 19:
            break
