import zipfile
p = r'C:\Users\pc\Documents\Projects\Blood-Banking-System\Blood-Banking-System-backend\.mvn\wrapper\maven-wrapper.jar'
with zipfile.ZipFile(p, 'r') as z:
    entries = [name for name in z.namelist() if 'MavenWrapperMain.class' in name]
    print(entries)
